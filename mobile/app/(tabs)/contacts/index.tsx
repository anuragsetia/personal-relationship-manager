import React, { useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { FAB, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { ContactCard } from '@/components/contacts/ContactCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ContactsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: contacts, isLoading } = useContacts(search);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Contacts',
          headerRight: () => null,
        }}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search contacts…" />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onPress={() => router.push(`/(tabs)/contacts/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No contacts found' : 'No contacts yet'}
              description={search ? 'Try a different search term' : 'Tap + to add your first contact'}
            />
          }
          contentContainerStyle={contacts?.length === 0 ? styles.emptyList : undefined}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/(tabs)/contacts/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, marginTop: 32 },
  emptyList: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
