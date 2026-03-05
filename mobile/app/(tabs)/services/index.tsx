import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ServicesScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Services' }} />
      <EmptyState
        title="Services — Phase 2"
        description="Track accounts, insurance, and subscriptions. Coming in Phase 2."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
