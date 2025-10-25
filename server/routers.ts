import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { analyzeContract, chatWithAI } from "./gemini";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          language: z.enum(["en", "ar"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.updateUserProfile(ctx.user.id, input);
        return user;
      }),
  }),

  contracts: router({
    // List user's contracts
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const contracts = await db.getUserContracts(ctx.user.id, input.limit, input.offset);
        return contracts;
      }),

    // Get contract by ID
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const contract = await db.getContractById(input.id);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (contract.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      return contract;
    }),

    // Create contract record and trigger analysis
    create: protectedProcedure
      .input(
        z.object({
          filename: z.string(),
          fileKey: z.string(),
          fileUrl: z.string(),
          fileSize: z.number(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const contractId = await db.createContract({
          userId: ctx.user.id,
          ...input,
          status: "processing",
        });

        // Trigger async analysis (in production, use a job queue)
        setImmediate(async () => {
          try {
            // Simulate text extraction (in production, extract from actual file)
            const extractedText = `This is a sample contract text for demonstration purposes.
            
            EMPLOYMENT CONTRACT
            
            This Employment Contract is entered into on January 1, 2024, between ABC Company ("Employer") and John Doe ("Employee").
            
            1. Position and Duties
            The Employee is hired as a Software Engineer and shall perform duties as assigned by the Employer.
            
            2. Compensation
            The Employee shall receive a monthly salary of 15,000 SAR, payable on the last day of each month.
            
            3. Working Hours
            The Employee shall work 40 hours per week, from Sunday to Thursday, 9:00 AM to 5:00 PM.
            
            4. Termination
            Either party may terminate this contract with 30 days written notice.
            
            5. Confidentiality
            The Employee agrees to maintain confidentiality of all proprietary information.
            
            6. Governing Law
            This contract shall be governed by the laws of the Kingdom of Saudi Arabia.`;

            // Analyze contract with Gemini AI
            const analysis = await analyzeContract(extractedText);

            // Update contract with analysis results
            await db.updateContract(contractId!, {
              extractedText,
              detectedLanguage: analysis.detectedLanguage,
              status: "analyzed",
              riskScore: analysis.riskScore,
              shariaCompliance: analysis.shariaCompliance,
              ksaCompliance: analysis.ksaCompliance,
              analyzedAt: new Date(),
            });
          } catch (error) {
            console.error("Contract analysis error:", error);
            await db.updateContract(contractId!, {
              status: "error",
              errorMessage: "Failed to analyze contract. Please try again.",
            });
          }
        });

        return { id: contractId };
      }),

    // Update contract (for analysis results)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          extractedText: z.string().optional(),
          detectedLanguage: z.enum(["en", "ar", "mixed"]).optional(),
          status: z.enum(["uploading", "processing", "analyzed", "error"]).optional(),
          riskScore: z.enum(["low", "medium", "high"]).optional(),
          shariaCompliance: z.enum(["compliant", "non_compliant", "requires_review"]).optional(),
          ksaCompliance: z.enum(["compliant", "non_compliant", "requires_review"]).optional(),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const contract = await db.getContractById(id);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        if (contract.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        const updated = await db.updateContract(id, {
          ...data,
          analyzedAt: data.status === "analyzed" ? new Date() : undefined,
        });
        return updated;
      }),

    // Delete contract
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const contract = await db.getContractById(input.id);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (contract.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.deleteContract(input.id);
      return { success: true };
    }),

    // Search contracts
    search: protectedProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
      const contracts = await db.searchContracts(ctx.user.id, input.query);
      return contracts;
    }),
  }),

  ai: router({
    // Get chat messages for a contract
    getMessages: protectedProcedure.input(z.object({ contractId: z.number() })).query(async ({ ctx, input }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (contract.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const messages = await db.getContractMessages(input.contractId);
      return messages;
    }),

    // Send chat message (AI response handled server-side)
    sendMessage: protectedProcedure
      .input(
        z.object({
          contractId: z.number(),
          content: z.string(),
          promptType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.contractId);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        if (contract.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        if (contract.status !== "analyzed" || !contract.extractedText) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Contract must be analyzed first" });
        }

        // Save user message
        const userMessageId = await db.createAiMessage({
          contractId: input.contractId,
          userId: ctx.user.id,
          role: "user",
          content: input.content,
          promptType: input.promptType,
        });

        // Get chat history
        const history = await db.getContractMessages(input.contractId);
        const chatHistory = history
          .filter(m => m.id !== userMessageId)
          .map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        // Get AI response
        const { response: aiResponse, tokensUsed } = await chatWithAI(
          contract.extractedText,
          chatHistory,
          input.content,
          contract.detectedLanguage === "ar" ? "ar" : "en"
        );

        // Save AI response
        const aiMessageId = await db.createAiMessage({
          contractId: input.contractId,
          userId: ctx.user.id,
          role: "assistant",
          content: aiResponse,
          tokensUsed,
        });

        return {
          userMessageId,
          aiMessageId,
          response: aiResponse,
        };
      }),

    // Submit feedback on AI message
    submitFeedback: protectedProcedure
      .input(
        z.object({
          messageId: z.number(),
          rating: z.enum(["thumbs_up", "thumbs_down"]),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const message = await db.getMessageById(input.messageId);
        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
        }

        // Check if feedback already exists
        const existing = await db.getFeedbackByMessage(input.messageId);
        if (existing) {
          await db.updateFeedback(existing.id, {
            rating: input.rating,
            comment: input.comment,
            messageId: input.messageId,
            userId: ctx.user.id,
          });
        } else {
          await db.createFeedback({
            messageId: input.messageId,
            userId: ctx.user.id,
            rating: input.rating,
            comment: input.comment,
          });
        }

        return { success: true };
      }),
  }),

  knowledge: router({
    // List user's knowledge base documents
    list: protectedProcedure.query(async ({ ctx }) => {
      const docs = await db.getUserKnowledgeBase(ctx.user.id);
      return docs;
    }),

    // Create knowledge base document
    create: protectedProcedure
      .input(
        z.object({
          filename: z.string(),
          fileKey: z.string(),
          fileUrl: z.string(),
          fileSize: z.number(),
          mimeType: z.string(),
          extractedText: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const docId = await db.createKnowledgeBase({
          userId: ctx.user.id,
          ...input,
        });
        return { id: docId };
      }),

    // Delete knowledge base document
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteKnowledgeBase(input.id);
      return { success: true };
    }),
  }),

  subscription: router({
    // Get current subscription
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await db.getUserSubscription(ctx.user.id);
      return subscription;
    }),

    // Get payment history
    getPayments: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const payments = await db.getUserPayments(ctx.user.id, input.limit, input.offset);
        return payments;
      }),
  }),

  support: router({
    // List user's tickets
    listTickets: protectedProcedure.query(async ({ ctx }) => {
      const tickets = await db.getUserTickets(ctx.user.id);
      return tickets;
    }),

    // Get ticket details with messages
    getTicket: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const ticket = await db.getSupportTicketById(input.id);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      const messages = await db.getTicketMessages(input.id);
      return { ticket, messages };
    }),

    // Create support ticket
    createTicket: protectedProcedure
      .input(
        z.object({
          subject: z.string(),
          message: z.string(),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Generate ticket number
        const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

        const ticketId = await db.createSupportTicket({
          ticketNumber,
          userId: ctx.user.id,
          subject: input.subject,
          status: "open",
          priority: input.priority,
        });

        // Add initial message
        await db.createTicketMessage({
          ticketId: ticketId!,
          senderId: ctx.user.id,
          senderType: "user",
          message: input.message,
        });

        return { id: ticketId, ticketNumber };
      }),

    // Reply to ticket
    replyToTicket: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ticket = await db.getSupportTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
        }
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        await db.createTicketMessage({
          ticketId: input.ticketId,
          senderId: ctx.user.id,
          senderType: ctx.user.role === "admin" ? "admin" : "user",
          message: input.message,
        });

        // Update ticket status to in_progress if it was open
        if (ticket.status === "open") {
          await db.updateTicket(input.ticketId, { status: "in_progress" });
        }

        return { success: true };
      }),
  }),

  // Admin routes
  admin: router({
    // Dashboard stats
    getDashboard: adminProcedure.query(async () => {
      const users = await db.getAllUsers(1000, 0);
      const subscriptions = await db.getAllSubscriptions(1000, 0);
      const tickets = await db.getAllTickets(100, 0);

      return {
        totalUsers: users.length,
        activeSubscriptions: subscriptions.filter(s => s.status === "active").length,
        openTickets: tickets.filter(t => t.status === "open").length,
        revenue: subscriptions.reduce((sum, s) => {
          // Calculate based on tier
          return sum + 0; // TODO: Calculate actual revenue
        }, 0),
      };
    }),

    // List all users
    listUsers: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        const users = await db.getAllUsers(input.limit, input.offset);
        return users;
      }),

    // Get user details
    getUser: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const user = await db.getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      const subscription = await db.getUserSubscription(input.id);
      const contracts = await db.getUserContracts(input.id, 10, 0);
      return { user, subscription, contracts };
    }),

    // List all tickets
    listTickets: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        const tickets = await db.getAllTickets(input.limit, input.offset);
        return tickets;
      }),

    // Update ticket
    updateTicket: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          assignedTo: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateTicket(id, data);

        // Log admin action
        await db.createAuditLog({
          adminUserId: ctx.user.id,
          action: "ticket_updated",
          resourceType: "ticket",
          resourceId: id,
          details: JSON.stringify(data),
        });

        return { success: true };
      }),
  }),

  // Prompt library
  prompts: router({
    // Get all active prompts
    list: publicProcedure.query(async () => {
      const prompts = await db.getActivePrompts();
      return prompts;
    }),

    // Get prompts by category
    getByCategory: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
      const prompts = await db.getPromptsByCategory(input.category);
      return prompts;
    }),
  }),
});

export type AppRouter = typeof appRouter;

