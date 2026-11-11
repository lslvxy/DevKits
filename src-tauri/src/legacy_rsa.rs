//! OpenSSL's traditional encrypted PKCS#1 PEM (Proc-Type / DEK-Info).
//! The legacy MD5 derivation is required for reading existing keys only.

use base64::{engine::general_purpose::STANDARD, Engine as _};
use cbc::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use md5::{Digest, Md5};
use pkcs8::der::{pem::LineEnding, Decode};
use pkcs8::SecretDocument;
use zeroize::{Zeroize, Zeroizing};

const DECRYPT_ERROR: &str = "decrypt failed (wrong passphrase or invalid RSA private key)";

pub(super) fn decrypt(pem: &str, passphrase: &str) -> Result<String, String> {
    let normalized = pem.trim().replace("\r\n", "\n");
    let inner = normalized
        .strip_prefix("-----BEGIN RSA PRIVATE KEY-----\n")
        .and_then(|s| s.strip_suffix("-----END RSA PRIVATE KEY-----"))
        .ok_or("invalid RSA PRIVATE KEY PEM boundaries")?;
    let (headers, body) = inner
        .split_once("\n\n")
        .ok_or("expected encrypted RSA PEM headers and a blank line before key data")?;
    let mut proc_type = None;
    let mut dek_info = None;
    for line in headers.lines() {
        if let Some(value) = line.strip_prefix("Proc-Type:") {
            if proc_type.replace(value.trim()).is_some() {
                return Err("duplicate Proc-Type header".into());
            }
        } else if let Some(value) = line.strip_prefix("DEK-Info:") {
            if dek_info.replace(value.trim()).is_some() {
                return Err("duplicate DEK-Info header".into());
            }
        } else {
            return Err("unsupported RSA PEM header".into());
        }
    }
    if proc_type != Some("4,ENCRYPTED") {
        return Err("expected Proc-Type: 4,ENCRYPTED".into());
    }
    let (algorithm, iv_hex) = dek_info
        .and_then(|s| s.split_once(','))
        .ok_or("missing or invalid DEK-Info header")?;
    let (key_length, iv_length) = match algorithm.trim() {
        "DES-EDE3-CBC" => (24, 8),
        "AES-128-CBC" => (16, 16),
        "AES-192-CBC" => (24, 16),
        "AES-256-CBC" => (32, 16),
        _ => {
            return Err(
                "unsupported RSA PEM cipher; expected DES-EDE3-CBC or AES-128/192/256-CBC".into(),
            )
        }
    };
    let iv_hex = iv_hex.trim();
    if !iv_hex.is_ascii() || iv_hex.len() != iv_length * 2 {
        return Err("invalid DEK-Info IV length".into());
    }
    let iv: Vec<u8> = (0..iv_hex.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&iv_hex[i..i + 2], 16).map_err(|_| "invalid DEK-Info IV hex"))
        .collect::<Result<_, _>>()?;
    let encoded: String = body.chars().filter(|c| !c.is_ascii_whitespace()).collect();
    let mut buffer = Zeroizing::new(
        STANDARD
            .decode(encoded)
            .map_err(|_| "invalid RSA PEM Base64 data")?,
    );
    if buffer.is_empty() || buffer.len() % iv_length != 0 {
        return Err("invalid RSA PEM ciphertext length".into());
    }

    // EVP_BytesToKey: D_i = MD5(D_(i-1) || password || IV[0..8]), count = 1.
    // The PEM IV is used directly; only the key bytes are derived.
    let mut key = Zeroizing::new([0u8; 32]);
    let mut previous = Zeroizing::new([0u8; 16]);
    let mut written = 0;
    while written < key_length {
        let mut hash = Md5::new();
        if written != 0 {
            hash.update(previous.as_slice());
        }
        hash.update(passphrase.as_bytes());
        hash.update(&iv[..8]);
        let mut digest = hash.finalize();
        previous.copy_from_slice(&digest);
        digest.as_mut_slice().zeroize();
        let count = (key_length - written).min(16);
        key[written..written + count].copy_from_slice(&previous[..count]);
        written += count;
    }

    macro_rules! decrypt_cbc {
        ($cipher:ty) => {
            cbc::Decryptor::<$cipher>::new_from_slices(&key[..key_length], &iv)
                .map_err(|_| "invalid RSA PEM cipher parameters")?
                .decrypt_padded_mut::<Pkcs7>(buffer.as_mut_slice())
                .map_err(|_| DECRYPT_ERROR)?
        };
    }
    let plaintext = match algorithm.trim() {
        "DES-EDE3-CBC" => decrypt_cbc!(des::TdesEde3),
        "AES-128-CBC" => decrypt_cbc!(aes::Aes128),
        "AES-192-CBC" => decrypt_cbc!(aes::Aes192),
        "AES-256-CBC" => decrypt_cbc!(aes::Aes256),
        _ => unreachable!(),
    };
    // Padding alone cannot establish that decryption produced an RSA key.
    pkcs1::RsaPrivateKey::from_der(plaintext).map_err(|_| DECRYPT_ERROR)?;
    let document = SecretDocument::try_from(plaintext).map_err(|_| DECRYPT_ERROR)?;
    document
        .to_pem("RSA PRIVATE KEY", LineEnding::LF)
        .map(|pem| pem.to_string())
        .map_err(|e| format!("encode RSA private key: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    const PLAIN: &str = include_str!("../tests/fixtures/rsa-traditional/plain.pem");
    const ENCRYPTED: [&str; 4] = [
        include_str!("../tests/fixtures/rsa-traditional/des-ede3-cbc.pem"),
        include_str!("../tests/fixtures/rsa-traditional/aes-128-cbc.pem"),
        include_str!("../tests/fixtures/rsa-traditional/aes-192-cbc.pem"),
        include_str!("../tests/fixtures/rsa-traditional/aes-256-cbc.pem"),
    ];

    #[test]
    fn decrypts_openssl_traditional_fixtures() {
        let (_, expected) = SecretDocument::from_pem(PLAIN).unwrap();
        for pem in ENCRYPTED {
            let out = crate::strip_private_key_passphrase(pem.into(), "fixture-only".into())
                .expect("traditional RSA PEM should decrypt");
            let (label, actual) = SecretDocument::from_pem(&out).unwrap();
            assert_eq!(label, "RSA PRIVATE KEY");
            assert_eq!(actual.as_bytes(), expected.as_bytes());
            assert!(!out.contains("Proc-Type"));
            assert!(!out.contains("DEK-Info"));
        }
    }

    #[test]
    fn accepts_crlf_line_endings() {
        assert!(decrypt(&ENCRYPTED[0].replace('\n', "\r\n"), "fixture-only").is_ok());
    }

    #[test]
    fn rejects_wrong_password_for_each_cipher() {
        for pem in ENCRYPTED {
            let err = decrypt(pem, "wrong").expect_err("wrong password must fail");
            assert_eq!(err, DECRYPT_ERROR);
        }
    }

    #[test]
    fn rejects_invalid_headers_and_cipher_parameters() {
        let pem = ENCRYPTED[0];
        for invalid in [
            pem.replace("4,ENCRYPTED", "4,INVALID"),
            pem.replace("DES-EDE3-CBC", "UNKNOWN-CBC"),
            pem.replace("DEK-Info:", "Other-Info:"),
            pem.replace(
                "Proc-Type: 4,ENCRYPTED",
                "Proc-Type: 4,ENCRYPTED\nProc-Type: 4,ENCRYPTED",
            ),
            pem.replace("DES-EDE3-CBC,", "DES-EDE3-CBC,00"),
            pem.replace("-----END RSA PRIVATE KEY-----", "-----END PRIVATE KEY-----"),
        ] {
            assert!(decrypt(&invalid, "fixture-only").is_err());
        }
        assert!(decrypt(PLAIN, "fixture-only").is_err());
    }

    #[test]
    fn rejects_corrupted_key_even_when_padding_is_untouched() {
        let (headers, body) = ENCRYPTED[0].split_once("\n\n").unwrap();
        let mut body = body.to_string();
        body.replace_range(0..1, if body.starts_with('A') { "B" } else { "A" });
        assert_eq!(
            decrypt(&format!("{headers}\n\n{body}"), "fixture-only").unwrap_err(),
            DECRYPT_ERROR
        );
    }
}
