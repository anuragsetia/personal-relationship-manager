import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  Menu,
  TouchableRipple,
  Divider,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { TagInput } from '@/components/shared/TagInput';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { COMMON_CURRENCIES } from '@/constants/currencies';
import { REMINDER_OPTIONS } from '@/constants/reminderOptions';
import { useContacts } from '@/hooks/useContacts';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['account', 'insurance', 'subscription']),
  provider: z.string().optional(),
  accountNumber: z.string().optional(),
  website: z.string().optional(),
  cost: z.string().optional(),
  costCurrency: z.string(),
  costFrequency: z.enum(['monthly', 'annual', 'one-time']).optional(),
  status: z.enum(['active', 'inactive', 'cancelled', 'pending']),
  startDate: z.number().optional(),
  renewalDate: z.number().optional(),
  expiryDate: z.number().optional(),
  reminderDays: z.number(),
  contactId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
});

export type ServiceFormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  submitLabel?: string;
};

type DateField = 'startDate' | 'renewalDate' | 'expiryDate';

export function ServiceForm({ defaultValues, onSubmit, submitLabel = 'Save' }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'subscription',
      costCurrency: 'USD',
      status: 'active',
      reminderDays: 7,
      tags: [],
      ...defaultValues,
    },
  });

  const [activeDatePicker, setActiveDatePicker] = useState<DateField | null>(null);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [reminderMenuVisible, setReminderMenuVisible] = useState(false);
  const [contactMenuVisible, setContactMenuVisible] = useState(false);
  const { data: contacts = [] } = useContacts();

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.name} mode="outlined" />
        )}
      />
      {errors.name && <Text variant="bodySmall" style={styles.error}>{errors.name.message}</Text>}

      {/* Category */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Category</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={SERVICE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
        )}
      />

      {/* Provider */}
      <Controller
        control={control}
        name="provider"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Provider" value={value} onChangeText={onChange} onBlur={onBlur} mode="outlined" />
        )}
      />

      {/* Account Number */}
      <Controller
        control={control}
        name="accountNumber"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Account / Policy Number" value={value} onChangeText={onChange} onBlur={onBlur} mode="outlined" />
        )}
      />

      {/* Website */}
      <Controller
        control={control}
        name="website"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Website" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" mode="outlined" />
        )}
      />

      <Divider style={styles.divider} />

      {/* Cost row */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Cost</Text>
      <View style={styles.row}>
        {/* Currency picker */}
        <Controller
          control={control}
          name="costCurrency"
          render={({ field: { value, onChange } }) => (
            <Menu
              visible={currencyMenuVisible}
              onDismiss={() => setCurrencyMenuVisible(false)}
              anchor={
                <TouchableRipple onPress={() => setCurrencyMenuVisible(true)} style={styles.currencyButton}>
                  <TextInput label="Currency" value={value} editable={false} mode="outlined" style={styles.currencyInput} right={<TextInput.Icon icon="chevron-down" />} />
                </TouchableRipple>
              }
            >
              {COMMON_CURRENCIES.map((c) => (
                <Menu.Item
                  key={c.code}
                  title={`${c.symbol} ${c.code}`}
                  onPress={() => { onChange(c.code); setCurrencyMenuVisible(false); }}
                />
              ))}
            </Menu>
          )}
        />

        {/* Amount */}
        <Controller
          control={control}
          name="cost"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Amount"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.costInput}
            />
          )}
        />
      </View>

      {/* Frequency */}
      <Controller
        control={control}
        name="costFrequency"
        render={({ field: { value, onChange } }) => (
          <SegmentedButtons
            value={value ?? ''}
            onValueChange={(v) => onChange(v || undefined)}
            buttons={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual' },
              { value: 'one-time', label: 'One-time' },
            ]}
          />
        )}
      />

      <Divider style={styles.divider} />

      {/* Dates */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Dates</Text>
      {(['startDate', 'renewalDate', 'expiryDate'] as DateField[]).map((field) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { value, onChange } }) => (
            <>
              <TouchableRipple onPress={() => setActiveDatePicker(activeDatePicker === field ? null : field)}>
                <TextInput
                  label={field === 'startDate' ? 'Start Date' : field === 'renewalDate' ? 'Renewal Date' : 'Expiry Date'}
                  value={value ? format(new Date(value), 'MMM d, yyyy') : ''}
                  editable={false}
                  mode="outlined"
                  right={value
                    ? <TextInput.Icon icon="close" onPress={() => onChange(undefined)} />
                    : <TextInput.Icon icon="calendar" />
                  }
                />
              </TouchableRipple>
              {activeDatePicker === field && (
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  onChange={(_e, date) => {
                    setActiveDatePicker(null);
                    if (date) onChange(date.getTime());
                  }}
                />
              )}
            </>
          )}
        />
      ))}

      {/* Reminder */}
      <Controller
        control={control}
        name="reminderDays"
        render={({ field: { value, onChange } }) => (
          <Menu
            visible={reminderMenuVisible}
            onDismiss={() => setReminderMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setReminderMenuVisible(true)}>
                <TextInput
                  label="Remind me"
                  value={REMINDER_OPTIONS.find((r) => r.days === value)?.label ?? `${value} days before`}
                  editable={false}
                  mode="outlined"
                  right={<TextInput.Icon icon="chevron-down" />}
                />
              </TouchableRipple>
            }
          >
            {REMINDER_OPTIONS.map((r) => (
              <Menu.Item
                key={r.days}
                title={r.label}
                onPress={() => { onChange(r.days); setReminderMenuVisible(false); }}
              />
            ))}
          </Menu>
        )}
      />

      <Divider style={styles.divider} />

      {/* Status */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Status</Text>
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        )}
      />

      {/* Linked contact */}
      <Divider style={styles.divider} />
      <Text variant="labelLarge" style={styles.sectionLabel}>Linked Contact</Text>
      <Controller
        control={control}
        name="contactId"
        render={({ field: { value, onChange } }) => {
          const selectedContact = contacts.find((c) => c.id === value);
          return (
            <Menu
              visible={contactMenuVisible}
              onDismiss={() => setContactMenuVisible(false)}
              anchor={
                <TouchableRipple onPress={() => setContactMenuVisible(true)}>
                  <TextInput
                    label="Contact (optional)"
                    value={selectedContact?.name ?? ''}
                    editable={false}
                    mode="outlined"
                    right={value
                      ? <TextInput.Icon icon="close" onPress={() => onChange(undefined)} />
                      : <TextInput.Icon icon="chevron-down" />
                    }
                  />
                </TouchableRipple>
              }
            >
              {contacts.map((c) => (
                <Menu.Item
                  key={c.id}
                  title={c.company ? `${c.name} · ${c.company}` : c.name}
                  onPress={() => { onChange(c.id); setContactMenuVisible(false); }}
                />
              ))}
              {contacts.length === 0 && (
                <Menu.Item title="No contacts yet" disabled />
              )}
            </Menu>
          );
        }}
      />

      {/* Notes */}
      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Notes" value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} mode="outlined" />
        )}
      />

      {/* Tags */}
      <Controller
        control={control}
        name="tags"
        render={({ field: { value, onChange } }) => (
          <TagInput value={value} onChange={onChange} />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submitButton}
      >
        {submitLabel}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  error: { color: '#B00020', marginTop: -8 },
  sectionLabel: { marginTop: 4 },
  divider: { marginVertical: 4 },
  row: { flexDirection: 'row', gap: 8 },
  currencyButton: { flex: 1 },
  currencyInput: { flex: 1 },
  costInput: { flex: 2 },
  submitButton: { marginTop: 8 },
});
