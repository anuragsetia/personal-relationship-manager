import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TagInput } from '@/components/shared/TagInput';
import type { NewContact } from '@/lib/db/schema';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  relationship: z.enum(['family', 'friend', 'professional', 'vendor']).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
});

export type ContactFormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<ContactFormValues>;
  onSubmit: (values: ContactFormValues) => Promise<void>;
  submitLabel?: string;
};

export function ContactForm({ defaultValues, onSubmit, submitLabel = 'Save' }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tags: [], ...defaultValues },
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Name *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.name}
            mode="outlined"
          />
        )}
      />
      {errors.name && <Text variant="bodySmall" style={styles.error}>{errors.name.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Phone"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="phone-pad"
            mode="outlined"
          />
        )}
      />

      <Controller
        control={control}
        name="company"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Company" value={value} onChangeText={onChange} onBlur={onBlur} mode="outlined" />
        )}
      />

      <Controller
        control={control}
        name="role"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput label="Role / Title" value={value} onChangeText={onChange} onBlur={onBlur} mode="outlined" />
        )}
      />

      <Text variant="labelLarge" style={styles.sectionLabel}>Relationship</Text>
      <Controller
        control={control}
        name="relationship"
        render={({ field: { value, onChange } }) => (
          <SegmentedButtons
            value={value ?? ''}
            onValueChange={(v) => onChange(v || undefined)}
            buttons={[
              { value: 'family', label: 'Family' },
              { value: 'friend', label: 'Friend' },
              { value: 'professional', label: 'Work' },
              { value: 'vendor', label: 'Vendor' },
            ]}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Notes"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            mode="outlined"
          />
        )}
      />

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
  submitButton: { marginTop: 8 },
});
