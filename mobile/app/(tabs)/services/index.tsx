import React, { useState } from 'react';
import { SectionList, View, StyleSheet } from 'react-native';
import { FAB, useTheme, Divider, ActivityIndicator, Text } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useServices } from '@/hooks/useServices';
import { ServiceCard } from '@/components/services/ServiceCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import type { Service } from '@/lib/db/schema';

type Section = { title: string; data: Service[] };

export default function ServicesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: allServices = [], isLoading } = useServices(undefined, search);

  const sections: Section[] = search
    ? [{ title: 'Results', data: allServices }]
    : SERVICE_CATEGORIES.map((cat) => ({
        title: cat.label,
        data: allServices.filter((s) => s.category === cat.value),
      })).filter((s) => s.data.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Services' }} />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search services…" />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => router.push(`/(tabs)/services/${item.id}`)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No services found' : 'No services yet'}
              description={search ? 'Try a different search term' : 'Tap + to add your first service'}
            />
          }
          contentContainerStyle={sections.length === 0 ? styles.emptyList : undefined}
          stickySectionHeadersEnabled
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/(tabs)/services/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, marginTop: 32 },
  emptyList: { flex: 1 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
