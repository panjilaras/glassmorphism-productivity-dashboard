import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Update user table with merged fields
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default('viewer'),
  position: text('position'),
  status: text('status').notNull().default('active'),
  managerId: text('manager_id').references((): any => user.id),
  joinDate: text('join_date'),
  avatarUrl: text('avatar_url'),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const taskCategories = sqliteTable('task_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color'),
  taskCount: integer('task_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('todo'),
  priority: text('priority').notNull().default('medium'),
  categoryId: integer('category_id').references(() => taskCategories.id),
  points: integer('points').default(0),
  assigneeIds: text('assignee_ids'),
  createdBy: text('created_by').references(() => user.id),
  updatedBy: text('updated_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  dueDate: text('due_date'),
});

export const documentationCategories = sqliteTable('documentation_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const documentation = sqliteTable('documentation', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => documentationCategories.id),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedBy: text('uploaded_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const themeSettings = sqliteTable('theme_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  backgroundGradientColors: text('background_gradient_colors', { mode: 'json' }).notNull(),
  backgroundOpacity: real('background_opacity').notNull(),
  backgroundImage: text('background_image'),
  loginIconColor: text('login_icon_color').notNull(),
  loginCardOpacity: real('login_card_opacity').notNull(),
  loginIconImage: text('login_icon_image'),
  cardBackgroundColor: text('card_background_color').notNull(),
  cardOpacity: real('card_opacity').notNull(),
  cardBorderOpacity: real('card_border_opacity').notNull(),
  updatedAt: text('updated_at').notNull(),
  updatedBy: text('updated_by').references(() => user.id),
});

// Auth tables for better-auth
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Add new assets table
export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  serialNumber: text('serial_number').notNull().unique(),
  assetHolder: text('asset_holder').notNull(),
  remark: text('remark'),
  version: text('version'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add new asset_transactions table
export const assetTransactions = sqliteTable('asset_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetId: integer('asset_id').notNull().references(() => assets.id),
  transactionType: text('transaction_type').notNull(),
  fromHolder: text('from_holder'),
  toHolder: text('to_holder'),
  remark: text('remark'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add new announcements table
export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  isActive: text('is_active').notNull().default('true'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add new chat_rooms table
export const chatRooms = sqliteTable('chat_rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  isDirect: text('is_direct').notNull().default('false'),
  participantIds: text('participant_ids', { mode: 'json' }).notNull(),
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add new messages table
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => chatRooms.id),
  senderId: text('sender_id').notNull().references(() => user.id),
  content: text('content'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add new deployment_history table
export const deploymentHistory = sqliteTable('deployment_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  version: text('version').notNull(),
  date: text('date').notNull(),
  title: text('title').notNull(),
  features: text('features').notNull(),
  isLatest: integer('is_latest').default(0),
  createdAt: text('created_at').notNull(),
});

// Add new task_bonus_points table at the end
export const taskBonusPoints = sqliteTable('task_bonus_points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull().references(() => tasks.id),
  userId: text('user_id').notNull().references(() => user.id),
  bonusPoints: integer('bonus_points').notNull(),
  awardedBy: text('awarded_by').references(() => user.id),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add new default_settings table at the end
export const defaultSettings = sqliteTable('default_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});