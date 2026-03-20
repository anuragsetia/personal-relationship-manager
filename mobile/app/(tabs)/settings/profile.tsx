import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Text, TextInput, Button, useTheme, Divider } from 'react-native-paper';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  LIFE_PHASES,
  INSTITUTION_LABEL,
  PROFILE_FIELDS,
  type LifePhase,
} from '@/constants/lifePhases';

export default function ProfileScreen() {
  const theme = useTheme();
  const { lifePhase, institutionName, context1, context2, saveProfile } = useSettingsStore();

  const [form, setForm] = useState({ lifePhase, institutionName, context1, context2 });
  const [saved, setSaved] = useState(false);

  // Re-sync form if store loads from DB after mount
  useEffect(() => {
    setForm({ lifePhase, institutionName, context1, context2 });
  }, [lifePhase, institutionName, context1, context2]);

  function patch(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    await saveProfile({
      lifePhase: form.lifePhase as LifePhase,
      institutionName: form.institutionName.trim(),
      context1: form.context1.trim(),
      context2: form.context2.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = PROFILE_FIELDS[form.lifePhase as LifePhase];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'My Profile' }} />

      <Text variant="labelLarge" style={styles.label}>I am a…</Text>
      {LIFE_PHASES.map((phase) => {
        const selected = form.lifePhase === phase.value;
        return (
          <Button
            key={phase.value}
            mode={selected ? 'contained' : 'outlined'}
            onPress={() => {
              patch('lifePhase', phase.value);
              // Reset context fields when phase changes
              setForm((f) => ({ ...f, lifePhase: phase.value, context1: '', context2: '' }));
              setSaved(false);
            }}
            style={styles.phaseButton}
            contentStyle={styles.phaseButtonContent}
          >
            {phase.label}
          </Button>
        );
      })}

      <Divider style={styles.divider} />

      <Text variant="labelLarge" style={styles.label}>
        {INSTITUTION_LABEL[form.lifePhase as LifePhase]}
      </Text>
      <TextInput
        mode="outlined"
        value={form.institutionName}
        onChangeText={(v) => patch('institutionName', v)}
        placeholder="e.g. Acme Corp, MIT, Self-employed"
      />

      {fields.map((field) => (
        <React.Fragment key={field.key}>
          <Text variant="labelLarge" style={styles.label}>{field.label}</Text>
          <TextInput
            mode="outlined"
            value={field.key === 'context1' ? form.context1 : form.context2}
            onChangeText={(v) => patch(field.key, v)}
            placeholder={field.placeholder}
          />
        </React.Fragment>
      ))}

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        icon={saved ? 'check' : undefined}
      >
        {saved ? 'Saved' : 'Save Profile'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10 },
  label: { marginTop: 8 },
  divider: { marginVertical: 8 },
  phaseButton: { borderRadius: 8 },
  phaseButtonContent: { justifyContent: 'flex-start', paddingVertical: 4 },
  saveButton: { marginTop: 16 },
});
