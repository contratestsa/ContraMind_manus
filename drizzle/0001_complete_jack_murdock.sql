CREATE TABLE `adminAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminUserId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(50),
	`resourceId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` enum('thumbs_up','thumbs_down') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`tokensUsed` int,
	`promptType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`extractedText` text,
	`detectedLanguage` enum('en','ar','mixed'),
	`status` enum('uploading','processing','analyzed','error') NOT NULL DEFAULT 'uploading',
	`errorMessage` text,
	`riskScore` enum('low','medium','high'),
	`shariaCompliance` enum('compliant','non_compliant','requires_review'),
	`ksaCompliance` enum('compliant','non_compliant','requires_review'),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`analyzedAt` timestamp,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeBase` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`extractedText` text,
	`description` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledgeBase_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','success','failed','refunded') NOT NULL,
	`paymentMethod` varchar(50),
	`transactionId` varchar(500),
	`apsOrderId` varchar(500),
	`apsPaymentId` varchar(500),
	`failureReason` text,
	`refundedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `promptLibrary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleAr` varchar(200),
	`prompt` text NOT NULL,
	`promptAr` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promptLibrary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('starter','professional','business') NOT NULL,
	`status` enum('active','canceled','expired','suspended') NOT NULL,
	`billingCycle` enum('monthly','annual') NOT NULL,
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`paymentMethodToken` varchar(500),
	`paymentMethodLast4` varchar(4),
	`paymentMethodBrand` varchar(50),
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(500) NOT NULL,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
CREATE TABLE `ticketMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('user','admin') NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticketMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free_trial','starter','professional','business') DEFAULT 'free_trial' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','trial','canceled','expired','suspended') DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `language` enum('en','ar') DEFAULT 'en' NOT NULL;--> statement-breakpoint
CREATE INDEX `adminUserId_idx` ON `adminAuditLog` (`adminUserId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `adminAuditLog` (`action`);--> statement-breakpoint
CREATE INDEX `messageId_idx` ON `aiFeedback` (`messageId`);--> statement-breakpoint
CREATE INDEX `contractId_idx` ON `aiMessages` (`contractId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `aiMessages` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `contracts` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `contracts` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `knowledgeBase` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `transactionId_idx` ON `payments` (`transactionId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `promptLibrary` (`category`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supportTickets` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `supportTickets` (`status`);--> statement-breakpoint
CREATE INDEX `ticketId_idx` ON `ticketMessages` (`ticketId`);