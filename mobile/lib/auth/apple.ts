import * as AppleAuthentication from 'expo-apple-authentication';

export type AppleUser = {
  id: string;
  name: string | null;
  email: string | null;
  identityToken: string;
};

export async function signInWithApple(): Promise<AppleUser> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const name = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ') || null
    : null;

  return {
    id: credential.user,
    name,
    email: credential.email ?? null,
    identityToken: credential.identityToken!,
  };
}

export function isAppleAuthAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync();
}
