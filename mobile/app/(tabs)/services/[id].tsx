import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Text,
  useTheme,
  Divider,
  Chip,
  ActivityIndicator,
  Menu,
  IconButton,
} from 'react-native-paper';
import { format } from 'date-fns';
import { useService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { ServiceForm, type ServiceFormValues } from '@/components/services/ServiceForm';
import { RenewalBadge } from '@/components/services/RenewalBadge';
import { COMMON_CURRENCIES } from '@/constants/currencies';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: service, isLoading } = useService(id);
  const { mutateAsync: updateService } = useUpdateService();
  const { mutateAsync: deleteService } = useDeleteService();

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 32 }} />;
  if (!service) return <Text style={{ padding: 16 }}>Service not found.</Text>;

  const tags: string[] = service.tags ? JSON.parse(service.tags) : [];
  const currencySymbol = COMMON_CURRENCIES.find((c) => c.code === service.costCurrency)?.symbol ?? service.costCurrency ?? '';

  async function handleDelete() {
    Alert.alert('Delete Service', `Delete "${service!.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteService(id);
          router.back();
        },
      },
    ]);
  }

  async function handleUpdate(values: ServiceFormValues) {
    await updateService({
      id,
      data: {
        name: values.name,
        category: values.category,
        provider: values.provider ?? null,
        accountNumber: values.accountNumber ?? null,
        website: values.website ?? null,
        cost: values.cost ? parseFloat(values.cost) : null,
        costCurrency: values.costCurrency,
        costFrequency: values.costFrequency ?? null,
        status: values.status,
        startDate: values.startDate ?? null,
        renewalDate: values.renewalDate ?? null,
        expiryDate: values.expiryDate ?? null,
        reminderDays: values.reminderDays,
        contactId: values.contactId ?? null,
        notes: values.notes ?? null,
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
            title: 'Edit Service',
            headerLeft: () => <IconButton icon="close" onPress={() => setEditing(false)} />,
          }}
        />
        <ServiceForm
          defaultValues={{
            name: service.name,
            category: service.category,
            provider: service.provider ?? '',
            accountNumber: service.accountNumber ?? '',
            website: service.website ?? '',
            cost: service.cost?.toString() ?? '',
            costCurrency: service.costCurrency ?? 'USD',
            costFrequency: service.costFrequency ?? undefined,
            status: service.status ?? 'active',
            startDate: service.startDate ?? undefined,
            renewalDate: service.renewalDate ?? undefined,
            expiryDate: service.expiryDate ?? undefined,
            reminderDays: service.reminderDays ?? 7,
            contactId: service.contactId ?? undefined,
            notes: service.notes ?? '',
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
          title: service.name,
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
            >
              <Menu.Item onPress={() => { setMenuVisible(false); setEditing(true); }} title="Edit" leadingIcon="pencil" />
              <Divider />
              <Menu.Item
                onPress={() => { setMenuVisible(false); handleDelete(); }}
                title="Delete"
                leadingIcon="delete"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          ),
        }}
      />

      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Status + category */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Chip compact>{service.category}</Chip>
            <Chip compact>{service.status ?? 'active'}</Chip>
            {service.renewalDate && <RenewalBadge dateMs={service.renewalDate} />}
          </View>
          {service.provider && (
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {service.provider}
            </Text>
          )}
        </View>

        <Divider />

        {/* Cost */}
        {service.cost ? (
          <>
            <View style={styles.section}>
              <Text variant="labelLarge">Cost</Text>
              <Text variant="bodyMedium">
                {currencySymbol}{service.cost}
                {service.costFrequency ? ` / ${service.costFrequency}` : ''}
              </Text>
            </View>
            <Divider />
          </>
        ) : null}

        {/* Dates */}
        {(service.startDate || service.renewalDate || service.expiryDate) ? (
          <>
            <View style={styles.section}>
              <Text variant="labelLarge">Dates</Text>
              {service.startDate && (
                <Text variant="bodyMedium">Start: {format(new Date(service.startDate), 'MMM d, yyyy')}</Text>
              )}
              {service.renewalDate && (
                <Text variant="bodyMedium">Renewal: {format(new Date(service.renewalDate), 'MMM d, yyyy')}</Text>
              )}
              {service.expiryDate && (
                <Text variant="bodyMedium">Expiry: {format(new Date(service.expiryDate), 'MMM d, yyyy')}</Text>
              )}
            </View>
            <Divider />
          </>
        ) : null}

        {/* Account info */}
        {(service.accountNumber || service.website) ? (
          <>
            <View style={styles.section}>
              <Text variant="labelLarge">Details</Text>
              {service.accountNumber && (
                <Text variant="bodyMedium">Account: {service.accountNumber}</Text>
              )}
              {service.website && (
                <Text variant="bodyMedium">{service.website}</Text>
              )}
            </View>
            <Divider />
          </>
        ) : null}

        {/* Notes */}
        {service.notes ? (
          <>
            <View style={styles.section}>
              <Text variant="labelLarge">Notes</Text>
              <Text variant="bodyMedium">{service.notes}</Text>
            </View>
            <Divider />
          </>
        ) : null}

        {/* Tags */}
        {tags.length > 0 && (
          <>
            <View style={[styles.section, styles.tagsRow]}>
              {tags.map((tag) => (
                <Chip key={tag} compact>{tag}</Chip>
              ))}
            </View>
            <Divider />
          </>
        )}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Added {format(new Date(service.createdAt), 'MMM d, yyyy')}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 16, gap: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 16 },
  footer: { padding: 16, alignItems: 'center' },
});
