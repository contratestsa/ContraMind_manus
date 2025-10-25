CREATE TABLE `brandingSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(200) NOT NULL,
	`companyNameAr` varchar(200),
	`tagline` varchar(500),
	`taglineAr` varchar(500),
	`logoUrl` text,
	`logoFileKey` varchar(500),
	`faviconUrl` text,
	`faviconFileKey` varchar(500),
	`primaryColor` varchar(7) DEFAULT '#2563eb',
	`secondaryColor` varchar(7) DEFAULT '#7c3aed',
	`accentColor` varchar(7) DEFAULT '#06b6d4',
	`supportEmail` varchar(320),
	`supportPhone` varchar(50),
	`websiteUrl` text,
	`twitterUrl` text,
	`linkedinUrl` text,
	`facebookUrl` text,
	`termsUrl` text,
	`privacyUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandingSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promptTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`displayName` varchar(200) NOT NULL,
	`displayNameAr` varchar(200),
	`description` text,
	`descriptionAr` text,
	`systemPrompt` text NOT NULL,
	`systemPromptAr` text,
	`userPromptTemplate` text NOT NULL,
	`userPromptTemplateAr` text,
	`variables` text,
	`category` varchar(100) NOT NULL,
	`tags` text,
	`version` int NOT NULL DEFAULT 1,
	`parentId` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promptTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `promptTemplates_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventId` varchar(500),
	`provider` varchar(50) NOT NULL,
	`signature` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`payload` text NOT NULL,
	`status` enum('pending','processing','processed','failed','ignored') NOT NULL DEFAULT 'pending',
	`processingAttempts` int NOT NULL DEFAULT 0,
	`lastProcessedAt` timestamp,
	`errorMessage` text,
	`errorStack` text,
	`userId` int,
	`paymentId` int,
	`subscriptionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhookEvents_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `promptTemplates` (`name`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `promptTemplates` (`category`);--> statement-breakpoint
CREATE INDEX `isActive_idx` ON `promptTemplates` (`isActive`);--> statement-breakpoint
CREATE INDEX `eventType_idx` ON `webhookEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `webhookEvents` (`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `webhookEvents` (`createdAt`);