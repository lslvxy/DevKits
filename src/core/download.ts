import { invoke } from "@tauri-apps/api/core";

/**
 * Show a native "Save As" dialog and write the text content to the chosen
 * path. No-op if the user cancels the dialog.
 */
export async function saveTextFile(filename: string, content: string): Promise<void> {
  await invoke("save_text_file", { content, defaultName: filename });
}

/**
 * Show a native "Save As" dialog and write base64-encoded bytes (e.g. an
 * image) to the chosen path. No-op if the user cancels the dialog.
 */
export async function saveBytesFile(filename: string, contentBase64: string): Promise<void> {
  await invoke("save_bytes", { contentBase64, defaultName: filename });
}
