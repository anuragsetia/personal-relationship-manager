import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, useTheme, Divider } from 'react-native-paper';
import { format } from 'date-fns';
import type { ContactInteraction } from '@/lib/db/schema';

const TYPE_ICONS: Record<string, string> = {
  call: 'phone',
  email: 'email',
  meeting: 'account-group',
  note: 'note-text',
};

type Props = {
  interactions: ContactInteraction[];
};

export function InteractionLogList({ interactions }: Props) {
  const theme = useTheme();

  if (interactions.length === 0) {
    return (
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, padding: 16 }}>
        No interactions logged yet.
      </Text>
    );
  }

  return (
    <View>
      {interactions.map((item, index) => (
        <View key={item.id}>
          <List.Item
            title={item.notes ?? item.type}
            description={format(new Date(item.date), 'MMM d, yyyy')}
            left={(props) => (
              <List.Icon {...props} icon={TYPE_ICONS[item.type] ?? 'calendar'} />
            )}
          />
          {index < interactions.length - 1 && <Divider />}
        </View>
      ))}
    </View>
  );
}
