import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSQLiteContext, SQLiteProvider } from 'expo-sqlite';
import { useAuthStore } from '@/stores/authStore';
import { runMigrations } from '@/lib/db/migrations';
import { configureGoogleSignIn } from '@/lib/auth/google';
import { theme } from '@/constants/theme';

const queryClient = new QueryClient();

configureGoogleSignIn();

function AuthGate() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)/contacts');
    }
  }, [user, isLoading, segments]);

  return <Slot />;
}

function DBProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    runMigrations(db).then(() => setLoading(false));
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="prm.db" useSuspense>
      <DBProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <AuthGate />
          </PaperProvider>
        </QueryClientProvider>
      </DBProvider>
    </SQLiteProvider>
  );
}
