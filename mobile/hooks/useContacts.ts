import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, like, desc, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contacts, contactInteractions } from '@/lib/db/schema';
import type { NewContact, NewContactInteraction } from '@/lib/db/schema';
import { randomUUID } from 'expo-crypto';

const CONTACTS_KEY = ['contacts'] as const;

export function useContacts(search?: string) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, search],
    queryFn: async () => {
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        return db
          .select()
          .from(contacts)
          .where(or(like(contacts.name, term), like(contacts.email, term), like(contacts.phone, term)))
          .orderBy(desc(contacts.updatedAt));
      }
      return db.select().from(contacts).orderBy(desc(contacts.updatedAt));
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: () => db.select().from(contacts).where(eq(contacts.id, id)).then((r) => r[0] ?? null),
    enabled: !!id,
  });
}

export function useContactInteractions(contactId: string) {
  return useQuery({
    queryKey: ['interactions', contactId],
    queryFn: () =>
      db
        .select()
        .from(contactInteractions)
        .where(eq(contactInteractions.contactId, contactId))
        .orderBy(desc(contactInteractions.date)),
    enabled: !!contactId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<NewContact, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const id = randomUUID();
      await db.insert(contacts).values({ ...data, id, createdAt: now, updatedAt: now });
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<NewContact, 'id' | 'createdAt'>>;
    }) => {
      await db
        .update(contacts)
        .set({ ...data, updatedAt: Date.now() })
        .where(eq(contacts.id, id));
    },
    onSuccess: (_r, { id }) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...CONTACTS_KEY, id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await db.delete(contacts).where(eq(contacts.id, id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  });
}

export function useAddInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<NewContactInteraction, 'id' | 'createdAt'>) => {
      const now = Date.now();
      await db.insert(contactInteractions).values({ ...data, id: randomUUID(), createdAt: now });
    },
    onSuccess: (_r, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', contactId] });
    },
  });
}
