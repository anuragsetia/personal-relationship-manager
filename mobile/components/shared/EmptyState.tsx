import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {title}
      </Text>
      {description ? (
        <Text
          variant="bodyMedium"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
