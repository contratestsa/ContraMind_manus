import { eq, desc, and, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  contracts,
  InsertContract,
  aiMessages,
  InsertAiMessage,
  knowledgeBase,
  InsertKnowledgeBase,
  aiFeedback,
  InsertAiFeedback,
  subscriptions,
  InsertSubscription,
  payments,
  InsertPayment,
  supportTickets,
  InsertSupportTicket,
  ticketMessages,
  InsertTicketMessage,
  adminAuditLog,
  InsertAdminAuditLog,
  promptLibrary,
  InsertPromptLibrary,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER OPERATIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    // Set trial period for new users (14 days)
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      values.trialEndsAt = trialEnd;
      values.subscriptionStatus = "trial";
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; email?: string; language?: "en" | "ar" }) {
  const db = await getDb();
  if (!db) return null;

  await db.update(users).set(data).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
}

// ==================== CONTRACT OPERATIONS ====================

export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(contracts).values(data);
  return Number(result[0].insertId);
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserContracts(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(contracts)
    .where(eq(contracts.userId, userId))
    .orderBy(desc(contracts.uploadedAt))
    .limit(limit)
    .offset(offset);
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(contracts).set(data).where(eq(contracts.id, id));
  return getContractById(id);
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(contracts).where(eq(contracts.id, id));
  return true;
}

export async function searchContracts(userId: number, searchTerm: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(contracts)
    .where(and(eq(contracts.userId, userId), sql`${contracts.filename} LIKE ${`%${searchTerm}%`}`))
    .orderBy(desc(contracts.uploadedAt));
}

// ==================== AI MESSAGE OPERATIONS ====================

export async function createAiMessage(data: InsertAiMessage) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(aiMessages).values(data);
  return Number(result[0].insertId);
}

export async function getContractMessages(contractId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(aiMessages).where(eq(aiMessages.contractId, contractId)).orderBy(aiMessages.createdAt);
}

export async function getMessageById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(aiMessages).where(eq(aiMessages.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== KNOWLEDGE BASE OPERATIONS ====================

export async function createKnowledgeBase(data: InsertKnowledgeBase) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(knowledgeBase).values(data);
  return Number(result[0].insertId);
}

export async function getUserKnowledgeBase(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId)).orderBy(desc(knowledgeBase.uploadedAt));
}

export async function deleteKnowledgeBase(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  return true;
}

// ==================== FEEDBACK OPERATIONS ====================

export async function createFeedback(data: InsertAiFeedback) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(aiFeedback).values(data);
  return Number(result[0].insertId);
}

export async function getFeedbackByMessage(messageId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(aiFeedback).where(eq(aiFeedback.messageId, messageId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateFeedback(id: number, data: Partial<InsertAiFeedback>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(aiFeedback).set(data).where(eq(aiFeedback.id, id));
  return getFeedbackByMessage(data.messageId!);
}

// ==================== SUBSCRIPTION OPERATIONS ====================

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(subscriptions).values(data);
  return Number(result[0].insertId);
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSubscription(userId: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
  return getUserSubscription(userId);
}

export async function getAllSubscriptions(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions).limit(limit).offset(offset).orderBy(desc(subscriptions.createdAt));
}

// ==================== PAYMENT OPERATIONS ====================

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(payments).values(data);
  return Number(result[0].insertId);
}

export async function getUserPayments(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);
}

export async function getPaymentByTransaction(transactionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(payments).where(eq(payments.transactionId, transactionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(payments).set(data).where(eq(payments.id, id));
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== SUPPORT TICKET OPERATIONS ====================

export async function createSupportTicket(data: InsertSupportTicket) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(supportTickets).values(data);
  return Number(result[0].insertId);
}

export async function getSupportTicketById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
}

export async function getAllTickets(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(supportTickets).limit(limit).offset(offset).orderBy(desc(supportTickets.createdAt));
}

export async function updateTicket(id: number, data: Partial<InsertSupportTicket>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
  return getSupportTicketById(id);
}

// ==================== TICKET MESSAGE OPERATIONS ====================

export async function createTicketMessage(data: InsertTicketMessage) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(ticketMessages).values(data);
  return Number(result[0].insertId);
}

export async function getTicketMessages(ticketId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt);
}

// ==================== ADMIN AUDIT LOG ====================

export async function createAuditLog(data: InsertAdminAuditLog) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(adminAuditLog).values(data);
  return Number(result[0].insertId);
}

export async function getAuditLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(adminAuditLog).limit(limit).offset(offset).orderBy(desc(adminAuditLog.createdAt));
}

// ==================== PROMPT LIBRARY OPERATIONS ====================

export async function createPrompt(data: InsertPromptLibrary) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(promptLibrary).values(data);
  return Number(result[0].insertId);
}

export async function getActivePrompts() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(promptLibrary).where(eq(promptLibrary.isActive, true)).orderBy(promptLibrary.displayOrder);
}

export async function getPromptsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(promptLibrary)
    .where(and(eq(promptLibrary.category, category), eq(promptLibrary.isActive, true)))
    .orderBy(promptLibrary.displayOrder);
}

