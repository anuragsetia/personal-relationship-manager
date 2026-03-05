import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { saveSecure, deleteSecure } from '../storage/secureStorage';

const GOOGLE_ACCESS_TOKEN_KEY = 'google_access_token';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    scopes: [
      'https://www.googleapis.com/auth/drive.appdata',
      'profile',
      'email',
    ],
    // webClientId is required for Drive scopes on Android — set via EAS env
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

export type GoogleUser = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  accessToken: string;
};

export async function signInWithGoogle(): Promise<GoogleUser> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();

  await saveSecure(GOOGLE_ACCESS_TOKEN_KEY, tokens.accessToken);

  return {
    id: userInfo.data!.user.id,
    name: userInfo.data!.user.name ?? null,
    email: userInfo.data!.user.email,
    photo: userInfo.data!.user.photo ?? null,
    accessToken: tokens.accessToken,
  };
}

export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
  await deleteSecure(GOOGLE_ACCESS_TOKEN_KEY);
}

export async function restoreGoogleSession(): Promise<GoogleUser | null> {
  try {
    const isSignedIn = await GoogleSignin.getCurrentUser();
    if (!isSignedIn) return null;

    const tokens = await GoogleSignin.getTokens();
    await saveSecure(GOOGLE_ACCESS_TOKEN_KEY, tokens.accessToken);

    const user = isSignedIn;
    return {
      id: user.user.id,
      name: user.user.name ?? null,
      email: user.user.email,
      photo: user.user.photo ?? null,
      accessToken: tokens.accessToken,
    };
  } catch {
    return null;
  }
}

export { statusCodes as googleStatusCodes };
