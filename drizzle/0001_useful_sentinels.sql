CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`representativeId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientCompany` varchar(255),
	`clientPhone` varchar(20) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientCity` varchar(100),
	`appointmentType` enum('reuniao_online','visita_presencial','ligacao') NOT NULL,
	`appointmentDate` date NOT NULL,
	`appointmentTime` time NOT NULL,
	`notes` text,
	`status` enum('pendente','confirmado','cancelado','concluido') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`representativeId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`intervalMinutes` int NOT NULL DEFAULT 60,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `date_blockages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`representativeId` int NOT NULL,
	`blockedDate` date NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `date_blockages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `representative_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`representativeId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `representative_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `representative_links_representativeId_unique` UNIQUE(`representativeId`),
	CONSTRAINT `representative_links_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `representatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(20),
	`city` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `representatives_id` PRIMARY KEY(`id`),
	CONSTRAINT `representatives_userId_unique` UNIQUE(`userId`)
);
