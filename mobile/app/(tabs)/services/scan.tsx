import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Button,
  Text,
  ActivityIndicator,
  useTheme,
  Card,
  Divider,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useSettingsStore } from '@/stores/settingsStore';
import { getSecure, SECURE_KEYS } from '@/lib/storage/secureStorage';
import { extractFromDocument, AIExtractionError } from '@/lib/ai/client';
import { readAsBase64, copyToLocalStorage } from '@/lib/storage/fileStorage';
import type { ExtractionResult } from '@/lib/ai/types';
import { randomUUID } from 'expo-crypto';

type Step = 'pick' | 'extracting' | 'done' | 'error';

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export default function ScanDocumentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { aiProvider, aiModel } = useSettingsStore();

  const [step, setStep] = useState<Step>('pick');
  const [errorMessage, setErrorMessage] = useState('');
  const [savedUri, setSavedUri] = useState('');

  async function runExtraction(uri: string, mimeType: string) {
    setStep('extracting');
    try {
      // Save file to permanent storage first
      const ext = mimeType.split('/')[1] ?? 'jpg';
      const filename = `${randomUUID()}.${ext}`;
      const permanent = await copyToLocalStorage(uri, filename);
      setSavedUri(permanent);

      // Get API key
      const apiKey = await getSecure(SECURE_KEYS.AI_API_KEY);
      if (!apiKey) {
        setStep('error');
        setErrorMessage('No API key configured. Go to Settings → AI to add your API key.');
        return;
      }

      // For PDFs we can only send the first page as image — for now send as-is
      // (Claude and Gemini accept PDF via base64, OpenAI does not)
      const base64 = await readAsBase64(permanent);
      const result: ExtractionResult = await extractFromDocument(
        aiProvider,
        aiModel,
        apiKey,
        base64,
        mimeType,
      );

      setStep('done');
      // Navigate to new service form with pre-filled values
      router.replace({
        pathname: '/(tabs)/services/new',
        params: {
          prefill: JSON.stringify(result),
          documentUri: permanent,
        },
      });
    } catch (err) {
      setStep('error');
      if (err instanceof AIExtractionError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    }
  }

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const mime = asset.mimeType ?? mimeFromUri(asset.uri);
      await runExtraction(asset.uri, mime);
    } catch {
      Alert.alert('Error', 'Could not open document picker.');
    }
  }

  async function handleTakePhoto() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera access is needed to scan documents.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      await runExtraction(asset.uri, 'image/jpeg');
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  }

  function handleRetry() {
    setStep('pick');
    setErrorMessage('');
    setSavedUri('');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: 'Scan Document' }} />

      {step === 'pick' && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.heading}>
                Extract service details from a document
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Take a photo or pick a PDF/image. The AI will extract the service name, provider, dates, and cost to pre-fill the form.
              </Text>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            icon="camera"
            onPress={handleTakePhoto}
            style={styles.button}
          >
            Take Photo
          </Button>

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            icon="file-document-outline"
            onPress={handlePickDocument}
            style={styles.button}
          >
            Pick from Files
          </Button>

          <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Supported: JPEG, PNG, PDF
          </Text>
        </>
      )}

      {step === 'extracting' && (
        <View style={styles.centred}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.extractingText}>
            Extracting details…
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Using {aiProvider} · {aiModel}
          </Text>
        </View>
      )}

      {step === 'error' && (
        <>
          <Card style={[styles.card, { borderColor: theme.colors.error }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.error }}>
                Extraction failed
              </Text>
              <Text variant="bodyMedium" style={styles.errorText}>
                {errorMessage}
              </Text>
            </Card.Content>
          </Card>

          <Button mode="contained" onPress={handleRetry} style={styles.button}>
            Try Again
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/(tabs)/services/new')}
            style={styles.button}
          >
            Add Manually Instead
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: { marginBottom: 8 },
  heading: { marginBottom: 8 },
  button: { marginTop: 4 },
  divider: { marginVertical: 8 },
  hint: { textAlign: 'center', marginTop: 4 },
  centred: { alignItems: 'center', gap: 16, paddingTop: 32 },
  extractingText: { marginTop: 8 },
  errorText: { marginTop: 8 },
});
