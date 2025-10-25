import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended for ContraMind.ai with subscription and profile fields
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // ContraMind specific fields
  subscriptionTier: mysqlEnum("subscriptionTier", ["free_trial", "starter", "professional", "business"]).default("free_trial").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trial", "canceled", "expired", "suspended"]).default("trial").notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  language: mysqlEnum("language", ["en", "ar"]).default("en").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contracts uploaded by users
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  filename: varchar("filename", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileSize: int("fileSize").notNull(), // bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  extractedText: text("extractedText"), // Full contract text
  detectedLanguage: mysqlEnum("detectedLanguage", ["en", "ar", "mixed"]),
  
  status: mysqlEnum("status", ["uploading", "processing", "analyzed", "error"]).default("uploading").notNull(),
  errorMessage: text("errorMessage"),
  
  // AI Analysis results
  riskScore: mysqlEnum("riskScore", ["low", "medium", "high"]),
  shariaCompliance: mysqlEnum("shariaCompliance", ["compliant", "non_compliant", "requires_review"]),
  ksaCompliance: mysqlEnum("ksaCompliance", ["compliant", "non_compliant", "requires_review"]),
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  analyzedAt: timestamp("analyzedAt"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * AI chat messages for contract analysis
 */
export const aiMessages = mysqlTable("aiMessages", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  userId: int("userId").notNull(),
  
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  
  tokensUsed: int("tokensUsed"),
  promptType: varchar("promptType", { length: 100 }), // e.g., "risk_analysis", "sharia_check", "custom"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  contractIdIdx: index("contractId_idx").on(table.contractId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = typeof aiMessages.$inferInsert;

/**
 * Knowledge base documents for context
 */
export const knowledgeBase = mysqlTable("knowledgeBase", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  filename: varchar("filename", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  extractedText: text("extractedText"),
  description: text("description"),
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

/**
 * User feedback on AI responses
 */
export const aiFeedback = mysqlTable("aiFeedback", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  
  rating: mysqlEnum("rating", ["thumbs_up", "thumbs_down"]).notNull(),
  comment: text("comment"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  messageIdIdx: index("messageId_idx").on(table.messageId),
}));

export type AiFeedback = typeof aiFeedback.$inferSelect;
export type InsertAiFeedback = typeof aiFeedback.$inferInsert;

/**
 * Subscriptions and billing
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  tier: mysqlEnum("tier", ["starter", "professional", "business"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "expired", "suspended"]).notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).notNull(),
  
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  
  paymentMethodToken: varchar("paymentMethodToken", { length: 500 }), // APS token
  paymentMethodLast4: varchar("paymentMethodLast4", { length: 4 }),
  paymentMethodBrand: varchar("paymentMethodBrand", { length: 50 }), // visa, mastercard, mada
  
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  canceledAt: timestamp("canceledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payment history
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  
  amount: int("amount").notNull(), // in cents/halalas
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  
  status: mysqlEnum("status", ["pending", "success", "failed", "refunded"]).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // visa, mastercard, mada, amex
  transactionId: varchar("transactionId", { length: 500 }).unique(),
  
  apsOrderId: varchar("apsOrderId", { length: 500 }),
  apsPaymentId: varchar("apsPaymentId", { length: 500 }),
  
  failureReason: text("failureReason"),
  refundedAt: timestamp("refundedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  transactionIdIdx: index("transactionId_idx").on(table.transactionId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Support tickets
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).unique().notNull(),
  userId: int("userId").notNull(),
  
  subject: varchar("subject", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  
  assignedTo: int("assignedTo"), // admin user id
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Support ticket messages
 */
export const ticketMessages = mysqlTable("ticketMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["user", "admin"]).notNull(),
  
  message: text("message").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  ticketIdIdx: index("ticketId_idx").on(table.ticketId),
}));

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Admin audit log
 */
export const adminAuditLog = mysqlTable("adminAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  
  action: varchar("action", { length: 100 }).notNull(), // e.g., "user_deleted", "subscription_modified"
  resourceType: varchar("resourceType", { length: 50 }), // e.g., "user", "contract", "subscription"
  resourceId: int("resourceId"),
  
  details: text("details"), // JSON string with additional info
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  adminUserIdIdx: index("adminUserId_idx").on(table.adminUserId),
  actionIdx: index("action_idx").on(table.action),
}));

export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

/**
 * Pre-built prompts library
 */
export const promptLibrary = mysqlTable("promptLibrary", {
  id: int("id").autoincrement().primaryKey(),
  
  category: varchar("category", { length: 100 }).notNull(), // e.g., "risk_analysis", "compliance", "financial"
  title: varchar("title", { length: 200 }).notNull(),
  titleAr: varchar("titleAr", { length: 200 }), // Arabic translation
  
  prompt: text("prompt").notNull(),
  promptAr: text("promptAr"), // Arabic version
  
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
}));

export type PromptLibrary = typeof promptLibrary.$inferSelect;
export type InsertPromptLibrary = typeof promptLibrary.$inferInsert;


/**
 * Centralized branding settings
 */
export const brandingSettings = mysqlTable("brandingSettings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Company branding
  companyName: varchar("companyName", { length: 200 }).notNull(),
  companyNameAr: varchar("companyNameAr", { length: 200 }),
  tagline: varchar("tagline", { length: 500 }),
  taglineAr: varchar("taglineAr", { length: 500 }),
  
  // Logos
  logoUrl: text("logoUrl"),
  logoFileKey: varchar("logoFileKey", { length: 500 }),
  faviconUrl: text("faviconUrl"),
  faviconFileKey: varchar("faviconFileKey", { length: 500 }),
  
  // Color scheme (hex values)
  primaryColor: varchar("primaryColor", { length: 7 }).default("#2563eb"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#7c3aed"),
  accentColor: varchar("accentColor", { length: 7 }).default("#06b6d4"),
  
  // Contact information
  supportEmail: varchar("supportEmail", { length: 320 }),
  supportPhone: varchar("supportPhone", { length: 50 }),
  websiteUrl: text("websiteUrl"),
  
  // Social media
  twitterUrl: text("twitterUrl"),
  linkedinUrl: text("linkedinUrl"),
  facebookUrl: text("facebookUrl"),
  
  // Legal
  termsUrl: text("termsUrl"),
  privacyUrl: text("privacyUrl"),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandingSettings = typeof brandingSettings.$inferSelect;
export type InsertBrandingSettings = typeof brandingSettings.$inferInsert;

/**
 * Webhook events log for debugging and reconciliation
 */
export const webhookEvents = mysqlTable("webhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  
  eventId: varchar("eventId", { length: 500 }).notNull().unique(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  chargeId: varchar("chargeId", { length: 500 }),
  paymentId: int("paymentId"),
  
  payload: text("payload").notNull(),
  signature: varchar("signature", { length: 500 }),
  
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processedAt"),
  processingError: text("processingError"),
  retryCount: int("retryCount").default(0).notNull(),
  
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index("webhookEvents_eventId_idx").on(table.eventId),
  chargeIdIdx: index("webhookEvents_chargeId_idx").on(table.chargeId),
  processedIdx: index("webhookEvents_processed_idx").on(table.processed),
}));

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

/**
 * AI prompt templates for dynamic prompt management
 */
export const promptTemplates = mysqlTable("promptTemplates", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 200 }).notNull().unique(),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  displayNameAr: varchar("displayNameAr", { length: 200 }),
  
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  
  systemPrompt: text("systemPrompt").notNull(),
  systemPromptAr: text("systemPromptAr"),
  
  userPromptTemplate: text("userPromptTemplate").notNull(),
  userPromptTemplateAr: text("userPromptTemplateAr"),
  
  variables: text("variables"), // JSON array
  
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags"), // JSON array
  
  version: int("version").default(1).notNull(),
  parentId: int("parentId"),
  
  usageCount: int("usageCount").default(0).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  
  isActive: boolean("isActive").default(true).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof promptTemplates.$inferInsert;

/**
 * Payment reconciliation logs
 */
export const reconciliationLogs = mysqlTable("reconciliationLogs", {
  id: int("id").autoincrement().primaryKey(),
  
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  
  totalTapPayments: int("totalTapPayments").notNull(),
  totalLocalPayments: int("totalLocalPayments").notNull(),
  missingInLocal: int("missingInLocal").notNull(),
  missingInTap: int("missingInTap").notNull(),
  statusMismatches: int("statusMismatches").notNull(),
  
  discrepancies: text("discrepancies"), // JSON array
  fixedCount: int("fixedCount").default(0).notNull(),
  
  triggeredBy: varchar("triggeredBy", { length: 50 }).notNull(), // "manual", "scheduled", "webhook"
  adminUserId: int("adminUserId"),
  executionTimeMs: int("executionTimeMs"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  startDateIdx: index("reconciliationLogs_startDate_idx").on(table.startDate),
}));

export type ReconciliationLog = typeof reconciliationLogs.$inferSelect;
export type InsertReconciliationLog = typeof reconciliationLogs.$inferInsert;

/**
 * Real User Monitoring (RUM) metrics
 */
export const rumMetrics = mysqlTable("rumMetrics", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId"),
  
  metricName: varchar("metricName", { length: 50 }).notNull(), // LCP, CLS, INP, FCP, TTFB
  metricValue: int("metricValue").notNull(), // in milliseconds or score
  metricRating: varchar("metricRating", { length: 20 }), // good, needs-improvement, poor
  metricDelta: int("metricDelta"),
  metricId: varchar("metricId", { length: 255 }),
  navigationType: varchar("navigationType", { length: 50 }),
  
  url: text("url"),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  metricNameIdx: index("metricName_idx").on(table.metricName),
  userIdIdx: index("userId_idx").on(table.userId),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type RumMetric = typeof rumMetrics.$inferSelect;
export type InsertRumMetric = typeof rumMetrics.$inferInsert;

