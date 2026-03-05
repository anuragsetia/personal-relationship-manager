import React from 'react';
import { Avatar, List, useTheme } from 'react-native-paper';
import type { Contact } from '@/lib/db/schema';

type Props = {
  contact: Contact;
  onPress: () => void;
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  family: '#E8F5E9',
  friend: '#E3F2FD',
  professional: '#FFF3E0',
  vendor: '#F3E5F5',
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
  const bgColor = contact.relationship
    ? RELATIONSHIP_COLORS[contact.relationship]
    : theme.colors.secondaryContainer;

  const left = () =>
    contact.avatarUri ? (
      <Avatar.Image size={40} source={{ uri: contact.avatarUri }} style={{ marginRight: 4 }} />
    ) : (
      <Avatar.Text
        size={40}
        label={getInitials(contact.name)}
        style={{ backgroundColor: bgColor, marginRight: 4 }}
        labelStyle={{ color: theme.colors.onSurface }}
      />
    );

  return (
    <List.Item
      title={contact.name}
      description={[contact.company, contact.role].filter(Boolean).join(' · ') || contact.email}
      left={left}
      onPress={onPress}
    />
  );
}
