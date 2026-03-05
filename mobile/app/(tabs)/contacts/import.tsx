import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, Checkbox, Button, ActivityIndicator, useTheme, Searchbar } from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import { useCreateContact } from '@/hooks/useContacts';

type DeviceContact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  selected: boolean;
};

export default function ImportContactsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mutateAsync: createContact } = useCreateContact();
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [filtered, setFiltered] = useState<DeviceContact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.Emails,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Company,
        ],
      });
      const mapped: DeviceContact[] = data
        .filter((c) => c.name)
        .map((c) => ({
          id: c.id!,
          name: c.name!,
          email: c.emails?.[0]?.email,
          phone: c.phoneNumbers?.[0]?.number,
          company: c.company,
          selected: false,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setContacts(mapped);
      setFiltered(mapped);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(term ? contacts.filter((c) => c.name.toLowerCase().includes(term)) : contacts);
  }, [search, contacts]);

  function toggleSelect(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  }

  async function handleImport() {
    const selected = contacts.filter((c) => c.selected);
    if (!selected.length) return;
    setImporting(true);
    await Promise.all(
      selected.map((c) =>
        createContact({
          name: c.name,
          email: c.email ?? null,
          phone: c.phone ?? null,
          company: c.company ?? null,
          source: 'device',
          tags: JSON.stringify([]),
        }),
      ),
    );
    setImporting(false);
    router.back();
  }

  const selectedCount = contacts.filter((c) => c.selected).length;

  if (permissionDenied) {
    return (
      <View style={styles.center}>
        <Text>Contacts permission denied. Enable it in Settings to import contacts.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Import Contacts' }} />
      <Searchbar
        placeholder="Search device contacts…"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Checkbox
                status={item.selected ? 'checked' : 'unchecked'}
                onPress={() => toggleSelect(item.id)}
              />
              <View style={styles.info}>
                <Text variant="bodyLarge">{item.name}</Text>
                {item.company && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.company}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      )}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleImport}
          disabled={selectedCount === 0 || importing}
          loading={importing}
        >
          Import {selectedCount > 0 ? `${selectedCount} Contact${selectedCount > 1 ? 's' : ''}` : ''}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 12, borderRadius: 12 },
  loader: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12 },
  info: { flex: 1, marginLeft: 8 },
  footer: { padding: 16 },
});
