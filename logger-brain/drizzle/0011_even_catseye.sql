ALTER TABLE "meetings" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "running_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "finished_at" timestamp with time zone;--> statement-breakpoint
UPDATE "meetings" SET "finished_at" = "updated_at" WHERE "duration" IS NOT NULL;