import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useCreateContact } from '@/hooks/useContacts';
import { ContactForm, type ContactFormValues } from '@/components/contacts/ContactForm';

export default function NewContactScreen() {
  const router = useRouter();
  const { mutateAsync: createContact } = useCreateContact();

  async function handleSubmit(values: ContactFormValues) {
    await createContact({
      name: values.name,
      email: values.email || null,
      phone: values.phone ?? null,
      company: values.company ?? null,
      role: values.role ?? null,
      knownFrom: values.knownFrom ?? null,
      institutionName: values.institutionName ?? null,
      relationshipType: values.relationshipType ?? null,
      notes: values.notes ?? null,
      tags: JSON.stringify(values.tags),
    });
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New Contact' }} />
      <ContactForm onSubmit={handleSubmit} submitLabel="Create Contact" />
    </>
  );
}
