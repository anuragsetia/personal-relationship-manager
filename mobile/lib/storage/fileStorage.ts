import * as FileSystem from 'expo-file-system/legacy';

const DOCS_DIR = `${FileSystem.documentDirectory}prm-docs/`;

async function ensureDocsDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DOCS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOCS_DIR, { intermediates: true });
  }
}

/**
 * Copy a file (from a temp/picker URI) into permanent app storage.
 * Returns the permanent URI.
 */
export async function copyToLocalStorage(sourceUri: string, filename: string): Promise<string> {
  await ensureDocsDir();
  const dest = `${DOCS_DIR}${filename}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

/**
 * Read a file and return its contents as a base64 string.
 */
export async function readAsBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/**
 * Delete a file from local storage.
 */
export async function deleteLocalFile(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}
