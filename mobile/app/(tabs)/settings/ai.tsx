import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import {
  Text,
  TextInput,
  SegmentedButtons,
  Button,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useSettingsStore, DEFAULT_MODELS, type AIProvider } from '@/stores/settingsStore';
import { saveSecure, getSecure, deleteSecure, SECURE_KEYS } from '@/lib/storage/secureStorage';

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'claude', label: 'Claude' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
];

export default function AISettingsScreen() {
  const theme = useTheme();
  const { aiProvider, aiModel, setAIProvider, setAIModel } = useSettingsStore();

  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSecure(SECURE_KEYS.AI_API_KEY).then((key) => {
      if (key) setApiKey(key);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    if (apiKey.trim()) {
      await saveSecure(SECURE_KEYS.AI_API_KEY, apiKey.trim());
    } else {
      await deleteSecure(SECURE_KEYS.AI_API_KEY);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'AI Settings' }} />

      <Text variant="labelLarge" style={styles.label}>Provider</Text>
      <SegmentedButtons
        value={aiProvider}
        onValueChange={(v) => setAIProvider(v as AIProvider)}
        buttons={PROVIDERS}
      />

      <Text variant="labelLarge" style={styles.label}>Model</Text>
      <TextInput
        mode="outlined"
        value={aiModel}
        onChangeText={setAIModel}
        placeholder={DEFAULT_MODELS[aiProvider]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <HelperText type="info">
        Default: {DEFAULT_MODELS[aiProvider]}
      </HelperText>

      <Text variant="labelLarge" style={styles.label}>API Key</Text>
      <TextInput
        mode="outlined"
        value={apiKey}
        onChangeText={(v) => { setApiKey(v); setSaved(false); }}
        placeholder={`Enter your ${aiProvider === 'claude' ? 'Anthropic' : aiProvider === 'openai' ? 'OpenAI' : 'Google AI'} API key`}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <HelperText type="info">
        Stored securely in your device keychain. Never sent to any server.
      </HelperText>

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={loading}
        style={styles.button}
        icon={saved ? 'check' : undefined}
      >
        {saved ? 'Saved' : 'Save'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  label: { marginTop: 8 },
  button: { marginTop: 16 },
});
