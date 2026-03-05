import * as SecureStore from 'expo-secure-store';

export async function saveSecure(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecure(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function deleteSecure(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

// Named keys used across the app
export const SECURE_KEYS = {
  GOOGLE_ACCESS_TOKEN: 'google_access_token',
  AI_API_KEY: 'ai_api_key',
} as const;
