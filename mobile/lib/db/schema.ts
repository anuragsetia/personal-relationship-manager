import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  role: text('role'),
  knownFrom: text('known_from'),
  institutionName: text('institution_name'),
  relationshipType: text('relationship_type'),
  notes: text('notes'),
  tags: text('tags'), // JSON string array
  source: text('source').$type<'manual' | 'device' | 'google' | 'apple'>().default('manual'),
  avatarUri: text('avatar_uri'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const contactInteractions = sqliteTable('contact_interactions', {
  id: text('id').primaryKey(),
  contactId: text('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  type: text('type').$type<'call' | 'email' | 'meeting' | 'note'>().notNull(),
  date: integer('date').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
});

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').$type<'account' | 'insurance' | 'subscription'>().notNull(),
  provider: text('provider'),
  accountNumber: text('account_number'),
  website: text('website'),
  startDate: integer('start_date'),
  renewalDate: integer('renewal_date'),
  expiryDate: integer('expiry_date'),
  cost: real('cost'),
  costCurrency: text('cost_currency').default('USD'),
  costFrequency: text('cost_frequency').$type<'monthly' | 'annual' | 'one-time'>(),
  status: text('status')
    .$type<'active' | 'inactive' | 'cancelled' | 'pending'>()
    .default('active'),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  notes: text('notes'),
  tags: text('tags'), // JSON string array
  reminderDays: integer('reminder_days').default(7),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  serviceId: text('service_id').references(() => services.id, { onDelete: 'cascade' }),
  name: text('name'),
  localPath: text('local_path'),
  cloudUrl: text('cloud_url'),
  mimeType: text('mime_type'),
  extractedData: text('extracted_data'), // JSON
  extractionStatus: text('extraction_status')
    .$type<'pending' | 'done' | 'failed'>()
    .default('pending'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type ContactInteraction = typeof contactInteractions.$inferSelect;
export type NewContactInteraction = typeof contactInteractions.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
