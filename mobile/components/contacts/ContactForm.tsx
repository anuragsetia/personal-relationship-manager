import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Menu, TouchableRipple } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TagInput } from '@/components/shared/TagInput';
import { useSettingsStore } from '@/stores/settingsStore';
import { KNOWN_FROM_OPTIONS, RELATIONSHIP_TYPES } from '@/constants/lifePhases';
import type { NewContact } from '@/lib/db/schema';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  knownFrom: z.string().optional(),
  institutionName: z.string().optional(),
  relationshipType: z.string().optional(),
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
  const { lifePhase, institutionName: myInstitution } = useSettingsStore();
  const knownFromOptions = KNOWN_FROM_OPTIONS[lifePhase];

  const [knownFromMenuVisible, setKnownFromMenuVisible] = useState(false);
  const [relationshipMenuVisible, setRelationshipMenuVisible] = useState(false);
  const relationshipOptions = RELATIONSHIP_TYPES[lifePhase];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tags: [],
      institutionName: myInstitution || '',
      ...defaultValues,
    },
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

      {/* Known from */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Where do you know them from?</Text>
      <Controller
        control={control}
        name="knownFrom"
        render={({ field: { value, onChange } }) => (
          <Menu
            visible={knownFromMenuVisible}
            onDismiss={() => setKnownFromMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setKnownFromMenuVisible(true)}>
                <TextInput
                  label="Known from"
                  value={value ?? ''}
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
            {knownFromOptions.map((option) => (
              <Menu.Item
                key={option}
                title={option}
                onPress={() => { onChange(option); setKnownFromMenuVisible(false); }}
              />
            ))}
          </Menu>
        )}
      />

      {/* Relationship type */}
      <Controller
        control={control}
        name="relationshipType"
        render={({ field: { value, onChange } }) => (
          <Menu
            visible={relationshipMenuVisible}
            onDismiss={() => setRelationshipMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setRelationshipMenuVisible(true)}>
                <TextInput
                  label="Relationship"
                  value={value ?? ''}
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
            {relationshipOptions.map((option) => (
              <Menu.Item
                key={option}
                title={option}
                onPress={() => { onChange(option); setRelationshipMenuVisible(false); }}
              />
            ))}
          </Menu>
        )}
      />

      {/* Institution */}
      <Controller
        control={control}
        name="institutionName"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Institution / Company"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            placeholder={myInstitution || 'e.g. Acme Corp, MIT'}
          />
        )}
      />

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
