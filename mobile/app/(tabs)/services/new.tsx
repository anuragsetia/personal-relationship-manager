import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useCreateService } from '@/hooks/useServices';
import { ServiceForm, type ServiceFormValues } from '@/components/services/ServiceForm';

export default function NewServiceScreen() {
  const router = useRouter();
  const { mutateAsync: createService } = useCreateService();

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
    router.replace(`/(tabs)/services/${id}`);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New Service' }} />
      <ServiceForm onSubmit={handleSubmit} submitLabel="Create Service" />
    </>
  );
}
