import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, like, desc, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import type { NewService } from '@/lib/db/schema';
import { randomUUID } from 'expo-crypto';
import { scheduleRenewalReminder, cancelRenewalReminder } from '@/lib/notifications/scheduler';
import type { ServiceCategory } from '@/constants/serviceCategories';

const SERVICES_KEY = ['services'] as const;

export function useServices(category?: ServiceCategory, search?: string) {
  return useQuery({
    queryKey: [...SERVICES_KEY, category, search],
    queryFn: async () => {
      let query = db.select().from(services);
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        return db
          .select()
          .from(services)
          .where(or(like(services.name, term), like(services.provider, term)))
          .orderBy(desc(services.updatedAt));
      }
      if (category) {
        return db
          .select()
          .from(services)
          .where(eq(services.category, category))
          .orderBy(desc(services.updatedAt));
      }
      return db.select().from(services).orderBy(desc(services.updatedAt));
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: [...SERVICES_KEY, id],
    queryFn: () => db.select().from(services).where(eq(services.id, id)).then((r) => r[0] ?? null),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<NewService, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const id = randomUUID();
      await db.insert(services).values({ ...data, id, createdAt: now, updatedAt: now });
      if (data.renewalDate && data.status === 'active') {
        await scheduleRenewalReminder(
          id,
          data.name,
          data.category,
          new Date(data.renewalDate),
          data.reminderDays ?? 7,
        );
      }
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<NewService, 'id' | 'createdAt'>>;
    }) => {
      await db
        .update(services)
        .set({ ...data, updatedAt: Date.now() })
        .where(eq(services.id, id));
      await cancelRenewalReminder(id);
      if (data.renewalDate && (data.status === 'active' || data.status === undefined)) {
        const [updated] = await db.select().from(services).where(eq(services.id, id));
        if (updated?.status === 'active') {
          await scheduleRenewalReminder(
            id,
            updated.name,
            updated.category,
            new Date(data.renewalDate),
            data.reminderDays ?? updated.reminderDays ?? 7,
          );
        }
      }
    },
    onSuccess: (_r, { id }) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
      queryClient.invalidateQueries({ queryKey: [...SERVICES_KEY, id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await cancelRenewalReminder(id);
      await db.delete(services).where(eq(services.id, id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}
