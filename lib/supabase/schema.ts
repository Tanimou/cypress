/**
 * The code snippets provided include the schema definitions for the 'workspaces', 'folders', and 'files' tables in a Supabase database.
 * Each table has columns defined with specific data types and constraints.
 * The 'workspaces' and 'folders' tables have a reference to each other through the 'workspaceId' column in the 'folders' table.
 * The 'files' table is similar to the 'folders' table but also includes a 'folderId' column that references the 'id' column of the 'folders' table.
 */

import { prices, products, subscriptionStatus, users } from '@/migrations/schema';
import { relations } from "drizzle-orm"
import { integer, boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Define the 'workspaces' table
export const workspaces = pgTable('workspaces', {

    // Define the 'id' column as a UUID with a default random value, primary key, and not null constraint
    id: uuid('id').defaultRandom().primaryKey().notNull(),

    // Define the 'createdAt' column as a timestamp with timezone, storing the value as a string
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'string',
    }).defaultNow().notNull(),

    // Define the 'workspaceOwner' column as a UUID, not null constraint
    workspaceOwner: uuid('workspace_owner').notNull(),

    // Define the 'title' column as text, not null constraint
    title: text('title').notNull(),

    // Define the 'iconId' column as a UUID, not null constraint
    iconId: text('icon_id').notNull(),

    // Define the 'data' column as text, not null constraint
    data: text('data'),

    // Define the 'inTrash' column as text, not null constraint
    inTrash: text('in_trash').notNull(),

    // Define the 'logo' column as text, not null constraint
    logo: text('logo'),

    // Define the 'bannerUrl' column as text, not null constraint
    bannerUrl: text('banner_url')
})

// Define the 'folders' table
export const folders = pgTable('folders', {

    // Define the 'id' column as a UUID with a default random value, primary key, and not null constraint
    id: uuid('id').defaultRandom().primaryKey().notNull(),

    // Define the 'createdAt' column as a timestamp with timezone, storing the value as a string
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'string',
    }).defaultNow().notNull(),

    // Define the 'workspaceId' column as a UUID, not null constraint
    workspaceId: uuid('workspace_id').notNull().references(()=>workspaces.id,{onDelete:'cascade'}),

    // Define the 'title' column as text, not null constraint
    title: text('title').notNull(),

    // Define the 'iconId' column as a UUID, not null constraint
    iconId: text('icon_id').notNull(),

    // Define the 'data' column as text, not null constraint
    data: text('data'),

    // Define the 'inTrash' column as text, not null constraint
    inTrash: text('in_trash'),


    // Define the 'bannerUrl' column as text, not null constraint
    bannerUrl: text('banner_url'),
})


//create a pgTable called files that's going to have the same variables as the table folders + the folderId that's referencing the folder id. Don't forget to export it
export const files = pgTable('files', {

    // Define the 'id' column as a UUID with a default random value, primary key, and not null constraint
    id: uuid('id').defaultRandom().primaryKey().notNull(),

    // Define the 'createdAt' column as a timestamp with timezone, storing the value as a string
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'string',
    }).defaultNow().notNull(),

    // Define the 'folderId' column as a UUID, not null constraint
    folderId: uuid('folder_id').notNull().references(() => folders.id, { onDelete: 'cascade' }),
    
    // Define the 'workspaceId' column as a UUID, not null constraint
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),


    // Define the 'title' column as text, not null constraint
    title: text('title').notNull(),

    // Define the 'iconId' column as a text, not null constraint
    iconId: text('icon_id').notNull(),

    // Define the 'data' column as text, not null constraint
    data: text('data'),

    // Define the 'inTrash' column as text, not null constraint
    inTrash: text('in_trash'),

    // Define the 'bannerUrl' column as text, not null constraint
    bannerUrl: text('banner_url'),
})

export const subscriptions = pgTable("subscriptions", {
    id: text("id").primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    status: subscriptionStatus("status"),
    metadata: jsonb("metadata"),
    priceId: text("price_id"),
    quantity: integer("quantity"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end"),
    created: timestamp("created", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    cancelAt: timestamp('cancel_at', { withTimezone: true, mode: 'string', }).defaultNow(),
    canceledAt: timestamp("canceled_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    trialStart: timestamp("trial_start", { withTimezone: true, mode: 'string' }).defaultNow(),
    trialEnd: timestamp("trial_end", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const collaborators = pgTable('collaborators', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'string',
    }).defaultNow().notNull(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const productsRelations = relations(products, ({ many }) => ({
    prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
    product: one(products, {
        fields: [prices.productId],
        references: [products.id],
    }),
}));