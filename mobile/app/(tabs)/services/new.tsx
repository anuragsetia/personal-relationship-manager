import React, { useMemo } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useCreateService } from '@/hooks/useServices';
import { ServiceForm, type ServiceFormValues } from '@/components/services/ServiceForm';
import { useCreateDocument } from '@/hooks/useServices';
import type { ExtractionResult } from '@/lib/ai/types';

function isoToMs(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const ms = new Date(iso).getTime();
  return isNaN(ms) ? undefined : ms;
}

function extractionToDefaults(result: ExtractionResult): Partial<ServiceFormValues> {
  return {
    name: result.name ?? '',
    provider: result.provider,
    category: result.category,
    accountNumber: result.accountNumber,
    website: result.website,
    cost: result.cost != null ? String(result.cost) : undefined,
    costCurrency: result.costCurrency ?? 'USD',
    costFrequency: result.costFrequency,
    startDate: isoToMs(result.startDate),
    renewalDate: isoToMs(result.renewalDate),
    expiryDate: isoToMs(result.expiryDate),
    notes: result.notes,
  };
}

export default function NewServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prefill?: string; documentUri?: string }>();
  const { mutateAsync: createService } = useCreateService();
  const { mutateAsync: createDocument } = useCreateDocument();

  const defaultValues = useMemo<Partial<ServiceFormValues> | undefined>(() => {
    if (!params.prefill) return undefined;
    try {
      const parsed = JSON.parse(params.prefill) as ExtractionResult;
      return extractionToDefaults(parsed);
    } catch {
      return undefined;
    }
  }, [params.prefill]);

  async function handleSubmit(values: ServiceFormValues) {
    const id = await createService({
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
    });

    // Attach scanned document if present
    if (params.documentUri) {
      const parts = params.documentUri.split('/');
      const filename = parts[parts.length - 1] ?? 'document';
      await createDocument({
        serviceId: id,
        name: filename,
        localPath: params.documentUri,
        mimeType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        extractedData: params.prefill ?? null,
        extractionStatus: params.prefill ? 'done' : 'pending',
      });
    }

    router.replace(`/(tabs)/services/${id}`);
  }

  return (
    <>
      <Stack.Screen options={{ title: params.prefill ? 'Review Extracted Service' : 'New Service' }} />
      <ServiceForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Create Service"
      />
    </>
  );
}
