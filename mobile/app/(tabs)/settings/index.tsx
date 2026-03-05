import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { List, Divider, useTheme, Avatar, Text } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { signOutGoogle } from '@/lib/auth/google';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuthStore();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          if (user?.provider === 'google') {
            await signOutGoogle();
          }
          signOut();
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView>
        {/* Account */}
        <View style={styles.accountHeader}>
          {user?.photo ? (
            <Avatar.Image size={56} source={{ uri: user.photo }} />
          ) : (
            <Avatar.Text size={56} label={user?.name?.[0] ?? '?'} />
          )}
          <View style={styles.accountInfo}>
            <Text variant="titleMedium">{user?.name ?? 'Unknown'}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.email ?? ''}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.provider === 'google' ? 'Google account' : 'Apple account'}
            </Text>
          </View>
        </View>

        <Divider />

        <List.Section>
          <List.Subheader>AI</List.Subheader>
          <List.Item
            title="AI Provider & API Key"
            description="Configure Claude, OpenAI, or Gemini"
            left={(props) => <List.Icon {...props} icon="robot" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Phase 3 */}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Sync</List.Subheader>
          <List.Item
            title="Cloud Sync"
            description={user?.provider === 'google' ? 'Google Drive (Phase 4)' : 'iCloud (Phase 5)'}
            left={(props) => <List.Icon {...props} icon="cloud-sync" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Phase 4 */}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Renewal Reminders"
            description="Configure reminder timing (Phase 2)"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Phase 2 */}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Item
            title="Sign Out"
            left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            titleStyle={{ color: theme.colors.error }}
            onPress={handleSignOut}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  accountInfo: { gap: 2 },
});
