import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Text,
  useTheme,
  Button,
  Divider,
  Chip,
  ActivityIndicator,
  Menu,
  IconButton,
} from 'react-native-paper';
import { format } from 'date-fns';
import { useContact, useContactInteractions, useDeleteContact, useUpdateContact } from '@/hooks/useContacts';
import { InteractionLogList } from '@/components/contacts/InteractionLogList';
import { ContactForm, type ContactFormValues } from '@/components/contacts/ContactForm';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: contact, isLoading } = useContact(id);
  const { data: interactions = [] } = useContactInteractions(id);
  const { mutateAsync: deleteContact } = useDeleteContact();
  const { mutateAsync: updateContact } = useUpdateContact();

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 32 }} />;
  if (!contact) return <Text style={{ padding: 16 }}>Contact not found.</Text>;

  const tags: string[] = contact.tags ? JSON.parse(contact.tags) : [];

  async function handleDelete() {
    Alert.alert('Delete Contact', `Delete "${contact!.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteContact(id);
          router.back();
        },
      },
    ]);
  }

  async function handleUpdate(values: ContactFormValues) {
    await updateContact({
      id,
      data: {
        ...values,
        email: values.email || null,
        tags: JSON.stringify(values.tags),
      },
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Edit Contact',
            headerLeft: () => (
              <IconButton icon="close" onPress={() => setEditing(false)} />
            ),
          }}
        />
        <ContactForm
          defaultValues={{
            name: contact.name,
            email: contact.email ?? '',
            phone: contact.phone ?? '',
            company: contact.company ?? '',
            role: contact.role ?? '',
            relationship: contact.relationship ?? undefined,
            notes: contact.notes ?? '',
            tags,
          }}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: contact.name,
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />
              }
            >
              <Menu.Item onPress={() => { setMenuVisible(false); setEditing(true); }} title="Edit" leadingIcon="pencil" />
              <Divider />
              <Menu.Item onPress={() => { setMenuVisible(false); handleDelete(); }} title="Delete" leadingIcon="delete" titleStyle={{ color: theme.colors.error }} />
            </Menu>
          ),
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header info */}
        <View style={styles.section}>
          {contact.company || contact.role ? (
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {[contact.role, contact.company].filter(Boolean).join(' at ')}
            </Text>
          ) : null}
          {contact.relationship && (
            <Chip compact style={styles.chip}>{contact.relationship}</Chip>
          )}
        </View>

        <Divider />

        {/* Contact info */}
        <View style={styles.section}>
          <Text variant="labelLarge">Contact Info</Text>
          {contact.email && <Text variant="bodyMedium">{contact.email}</Text>}
          {contact.phone && <Text variant="bodyMedium">{contact.phone}</Text>}
        </View>

        {contact.notes && (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="labelLarge">Notes</Text>
              <Text variant="bodyMedium">{contact.notes}</Text>
            </View>
          </>
        )}

        {tags.length > 0 && (
          <>
            <Divider />
            <View style={[styles.section, styles.tags]}>
              {tags.map((tag) => (
                <Chip key={tag} compact style={styles.chip}>{tag}</Chip>
              ))}
            </View>
          </>
        )}

        <Divider />

        {/* Interaction log */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>Interactions</Text>
          <InteractionLogList interactions={interactions} />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Added {format(new Date(contact.createdAt), 'MMM d, yyyy')}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 16, gap: 6 },
  sectionTitle: { marginBottom: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { alignSelf: 'flex-start' },
  footer: { padding: 16, alignItems: 'center' },
});
