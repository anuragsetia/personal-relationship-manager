import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple, isAppleAuthAvailable } from '@/lib/auth/apple';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function LoginScreen() {
  const theme = useTheme();
  const setUser = useAuthStore((s) => s.setUser);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    isAppleAuthAvailable().then(setAppleAvailable);
  }, []);

  async function handleGoogleSignIn() {
    setError(null);
    setLoadingProvider('google');
    try {
      const user = await signInWithGoogle();
      setUser({ ...user, provider: 'google' });
    } catch (e: any) {
      if (e.code !== 'SIGN_IN_CANCELLED') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleAppleSignIn() {
    setError(null);
    setLoadingProvider('apple');
    try {
      const user = await signInWithApple();
      setUser({ ...user, photo: null, provider: 'apple' });
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        setError('Apple sign-in failed. Please try again.');
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={{ fontWeight: 'bold' }}>PRM</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          Your personal resource manager.{'\n'}Your data, your cloud.
        </Text>
      </View>

      <View style={styles.buttons}>
        {error && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, textAlign: 'center' }}>
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          icon="google"
          onPress={handleGoogleSignIn}
          loading={loadingProvider === 'google'}
          disabled={!!loadingProvider}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Continue with Google
        </Button>

        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}
      </View>

      <Text variant="bodySmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
        No account needed. Data stored in your Google Drive or iCloud.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 32 },
  header: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttons: { gap: 12, marginBottom: 16 },
  button: { borderRadius: 8 },
  buttonContent: { height: 48 },
  appleButton: { height: 48, width: '100%' },
  footer: { textAlign: 'center', marginBottom: 8 },
});
