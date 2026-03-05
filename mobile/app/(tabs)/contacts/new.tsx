import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useCreateContact } from '@/hooks/useContacts';
import { ContactForm, type ContactFormValues } from '@/components/contacts/ContactForm';

export default function NewContactScreen() {
  const router = useRouter();
  const { mutateAsync: createContact } = useCreateContact();

  async function handleSubmit(values: ContactFormValues) {
    await createContact({
      ...values,
      email: values.email || null,
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
