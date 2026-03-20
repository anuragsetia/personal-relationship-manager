import React from 'react';
import { Avatar, List, useTheme } from 'react-native-paper';
import type { Contact } from '@/lib/db/schema';

type Props = {
  contact: Contact;
  onPress: () => void;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ContactCard({ contact, onPress }: Props) {
  const theme = useTheme();

  const left = () =>
    contact.avatarUri ? (
      <Avatar.Image size={40} source={{ uri: contact.avatarUri }} style={{ marginRight: 4 }} />
    ) : (
      <Avatar.Text
        size={40}
        label={getInitials(contact.name)}
        style={{ backgroundColor: theme.colors.secondaryContainer, marginRight: 4 }}
        labelStyle={{ color: theme.colors.onSecondaryContainer }}
      />
    );

  const description = [
    contact.relationshipType,
    contact.institutionName ?? contact.company,
  ]
    .filter(Boolean)
    .join(' · ') || contact.knownFrom || contact.email;

  return (
    <List.Item
      title={contact.name}
      description={description}
      left={left}
      onPress={onPress}
    />
  );
}
