ALTER TABLE "meetings" ADD COLUMN "additional_info" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "platform" varchar(30);--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "meeting_url" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "access_details" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "duration" integer;