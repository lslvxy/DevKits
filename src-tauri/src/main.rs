// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::OnceLock;

use pkcs8::der::pem::LineEnding;
use pkcs8::{EncryptedPrivateKeyInfo, SecretDocument};
use tauri_plugin_dialog::DialogExt;

// Bundled PlantUML jar (renders diagrams locally, no network required).
const PLANTUML_JAR: &[u8] = include_bytes!("../plantuml.jar");

/// Write the embedded jar to a temp dir once, then reuse it across renders.
fn ensure_jar() -> Result<PathBuf, String> {
    static JAR_PATH: OnceLock<Result<PathBuf, String>> = OnceLock::new();
    JAR_PATH
        .get_or_init(|| {
            let dir = std::env::temp_dir().join("devkits");
            std::fs::create_dir_all(&dir).map_err(|e| format!("create temp dir: {e}"))?;
            let path = dir.join("plantuml.jar");
            let need_write = match std::fs::metadata(&path) {
                Ok(m) => m.len() != PLANTUML_JAR.len() as u64,
                Err(_) => true,
            };
            if need_write {
                std::fs::write(&path, PLANTUML_JAR).map_err(|e| format!("write jar: {e}"))?;
            }
            Ok(path)
        })
        .clone()
}

/// Render PlantUML source locally via the bundled jar.
/// `format` is `"svg"` (default) or `"png"`; SVG is returned as a UTF-8 string.
#[tauri::command]
fn render_plantuml(source: String, format: Option<String>) -> Result<String, String> {
    let jar = ensure_jar()?;
    let flag = match format.as_deref() {
        Some("png") => "-tpng",
        _ => "-tsvg",
    };

    let mut child = Command::new("java")
        .arg("-Djava.awt.headless=true")
        .arg("-jar")
        .arg(&jar)
        .arg("-pipe")
        .arg(flag)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to start Java ({e}). Is Java 8+ installed and on PATH?"))?;

    child
        .stdin
        .take()
        .ok_or_else(|| "failed to open stdin".to_string())?
        .write_all(source.as_bytes())
        .map_err(|e| format!("write source: {e}"))?;

    let output = child.wait_with_output().map_err(|e| format!("wait: {e}"))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("PlantUML render failed: {}", stderr.trim()));
    }
    String::from_utf8(output.stdout).map_err(|e| format!("invalid UTF-8 output: {e}"))
}

/// Remove the passphrase from an encrypted PKCS#8 private key
/// ("BEGIN ENCRYPTED PRIVATE KEY"), returning the unencrypted PEM
/// ("BEGIN PRIVATE KEY"). Supports PBES2 (modern) and legacy PBES1 schemes.
#[tauri::command]
fn strip_private_key_passphrase(encrypted_pem: String, passphrase: String) -> Result<String, String> {
    let (label, doc) = SecretDocument::from_pem(encrypted_pem.trim())
        .map_err(|e| format!("invalid PEM input: {e}"))?;
    if label != "ENCRYPTED PRIVATE KEY" {
        return Err(format!(
            "unsupported PEM label \"{label}\": expected an ENCRYPTED PRIVATE KEY (PKCS#8)"
        ));
    }
    let epki = EncryptedPrivateKeyInfo::try_from(doc.as_bytes())
        .map_err(|e| format!("invalid encrypted private key: {e}"))?;
    let decrypted = epki
        .decrypt(passphrase.as_bytes())
        .map_err(|e| format!("decrypt failed (wrong passphrase or unsupported algorithm): {e}"))?;
    decrypted
        .to_pem("PRIVATE KEY", LineEnding::LF)
        .map(|pem| pem.to_string())
        .map_err(|e| e.to_string())
}

/// Show a native "Save As" dialog and write the given text content to the
/// chosen path. Returns `None` if the user cancelled.
#[tauri::command]
async fn save_text_file(
    app: tauri::AppHandle,
    content: String,
    default_name: Option<String>,
) -> Result<Option<String>, String> {
    let file = app
        .dialog()
        .file()
        .set_file_name(default_name.as_deref().unwrap_or("file.txt"))
        .blocking_save_file();

    let Some(file) = file else {
        return Ok(None);
    };

    let path = file.into_path().map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| format!("write file: {e}"))?;
    Ok(Some(path.to_string_lossy().to_string()))
}

/// Show a native "Save As" dialog and write the given base64-encoded bytes
/// (e.g. a QR PNG) to the chosen path. Returns `None` if the user cancelled.
#[tauri::command]
async fn save_bytes(
    app: tauri::AppHandle,
    content_base64: String,
    default_name: Option<String>,
) -> Result<Option<String>, String> {
    use base64::{engine::general_purpose, Engine as _};

    let file = app
        .dialog()
        .file()
        .set_file_name(default_name.as_deref().unwrap_or("file"))
        .blocking_save_file();

    let Some(file) = file else {
        return Ok(None);
    };

    // Defer decoding until a destination exists; a cancelled dialog allocates no bytes.
    let bytes = general_purpose::STANDARD
        .decode(content_base64.trim())
        .map_err(|e| format!("invalid base64: {e}"))?;
    drop(content_base64);
    let path = file.into_path().map_err(|e| e.to_string())?;
    std::fs::write(&path, bytes).map_err(|e| format!("write file: {e}"))?;
    Ok(Some(path.to_string_lossy().to_string()))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            render_plantuml,
            strip_private_key_passphrase,
            save_text_file,
            save_bytes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::strip_private_key_passphrase;

    // Test key generated with: openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
    //   -aes-256-cbc -pass pass:test123
    const ENCRYPTED_PEM: &str = "-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIFNTBfBgkqhkiG9w0BBQ0wUjAxBgkqhkiG9w0BBQwwJAQQqdBABdKNKJfD3U0h
IJRU2QICCAAwDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEEFJQYQoV+FRpduUI
2ZTkK7MEggTQcmyIF+mrwdQDr0g0e4cx5Km8kz1fnboDP/ln62onrhj1XEcCc60V
3jGimxB66T2EHsumzJTd09Ta+J/wqaIJ6IhIKwDqyDy5Dy3FAnIGVRUCQlGDGvdA
ApE7nxy8WtyTRhqm7nHFhI6tQzY6SJ6DZQzdHbXkIgAbEMgJJV2YjZZMhKQPaKIr
ehSBnJj8KKF4mXuspQRL9ZKKa38OEFFqesFP6Fi2jjRxer+81onvfgZGvn9bh81M
vcSWxAXaaH9dF1YCWvFJBi1Hzu/tfRAkPcT3+Qgtt9cYey4OMy699ejU4dEGx5HS
iOWYgHrAOz/Dw1B4lm9B/2aUNkNzQzJ6obU4jfzw9vYTbLVAXgpQUyba2Hc9Zvmv
WwNnGowhyamunex07i38iNia9tOPbxH1wrzWaJJlRC/Ub6ntHs8+st6EWOQJzArA
xjCMVq5VZkbjO31S+pZm9AFQNC1K0MHFJn8/QnLRTaGMYsXvlG/bBBMgkD4XsN8m
dLVWm3Zn5jCXN98A8RWjvLYsMvJ7WEesUlIeD5ka0OBER0DTVO0hYFBWGs60MnqC
x4+qi3c5oIE/iPlD/YURbQGfbsmx/UbW2Y9BJx9J9YjXsFXx61CgEIkQBEBnAKDI
9Nuin6FT1BV+h6kX5ybkWp6UlE6jiy8iFDy/iG5V173o2+5W/mVHTHks72H4Zc4v
YC6Afu0DB+JjQOGWojFV96s7vFaTylLdcuaLwvvID+N6erwsFiW0nX1Ry8CjKScJ
2Rv6Bw6iO5UK43TKn9TnpO0PY1znll093HO+tbJ/h2zSy4Ka9D08cUop4f1DeWGM
QxSkuVGJyQadvi6qrVp7swh9U2eHrmG/IjdmOH84vJpfWRmu1Sk9QedYIpqsBJNY
dMXkNtKQHo2RCxXkLeGyllheZGOUeiZ4posdcI2iVX826GktLABsf2iZDQgHpNy+
u0nofX7v7qKN8/EnDrdkmvBHR664c8fVyM1ICWIfSLSFc51moqGBhF1UkeFvWrVD
yf7b1OARjeQDUVGu3rGTjQUvYUezSOECxcJCh4pDACbjD0E+OFj1b5jE7eschOfD
/Cm075zibDEBKh5byIM1DdsmnhZC+G9qRwZ0M4ge4gmZyJ5c/aLF/kQTR5mbU0vf
vjiot3SPxxVw/ZJpaaYxg6x2LvWaYDZPKPunKwTb37oXzJ/LupsW63Y2jCW5LVvC
iRD/YCDVuFt5V5yPZ5SIH0I4sNmTmiAqe8Tfe2/kogkv3tMOaVdlL890nSp72yGs
9+jHrhMCnQkBbYNK1M5/j5CWUuIXwoQX7m/WNf8WiiSXCsuXQ3PV0v484ryWrODE
lgbr1pGAKLNuW25OSKME8gEAIi70rrNN6yq4t3PC0r6BPiWqWHaZLs7JHw5wWXs4
Ofu4K1MlyYKFxkxbds5DjzKgNV1+SRQ4AdyAufHzXKhVD59twWWbUDHJ2h20GMuE
UMUmdlOU5/U/pppNSLvOsZSUdJ6/J1CcZXgWlTYUc67htzosIR870kXrXRQuPE23
1dD0Fn9B51rNCnqcpmRhyWxS0TyiQvHgH1CUlFg7YfNp8TUVLqpXbrSU7SbdIIgk
LutC8PbjLeeCiONNkz/6jV1dXKE+rAogZ64Y3fL/6ind4xAEr9xLuds=
-----END ENCRYPTED PRIVATE KEY-----";

    #[test]
    fn decrypts_encrypted_pkcs8() {
        let out = strip_private_key_passphrase(ENCRYPTED_PEM.to_string(), "test123".to_string())
            .expect("decrypt should succeed");
        assert!(out.starts_with("-----BEGIN PRIVATE KEY-----"));
        assert!(out.contains("-----END PRIVATE KEY-----"));
    }

    #[test]
    fn rejects_wrong_passphrase() {
        let err = strip_private_key_passphrase(ENCRYPTED_PEM.to_string(), "wrong".to_string())
            .expect_err("wrong passphrase should fail");
        assert!(err.contains("decrypt failed"));
    }
}
