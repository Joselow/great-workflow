CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE TABLE "log_meetings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"log_id" uuid NOT NULL,
	"meeting_id" uuid NOT NULL,
	"source" varchar(8) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "log_meetings_log_id_meeting_id_uidx" ON "log_meetings" USING btree ("log_id","meeting_id");
--> statement-breakpoint
CREATE TABLE "card_meetings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"card_id" uuid NOT NULL,
	"meeting_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "card_meetings_card_id_meeting_id_uidx" ON "card_meetings" USING btree ("card_id","meeting_id");
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "project_id" uuid;
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "title" varchar(100) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "topic_status" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "participants" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "color" varchar(7) DEFAULT '#f5f5f4' NOT NULL;
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "agenda" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "meetings" SET "topic_status" = COALESCE("state", '') WHERE "state" IS NOT NULL;
--> statement-breakpoint
INSERT INTO "log_meetings" ("id", "log_id", "meeting_id", "source", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", "meeting_id",
	CASE
		WHEN TRIM("type_meeting_link"::text) IN ('meet-log') THEN 'meeting'
		ELSE 'log'
	END,
	now(), now()
FROM "logs"
WHERE "meeting_id" IS NOT NULL
ON CONFLICT ("log_id", "meeting_id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "card_meetings" ("id", "card_id", "meeting_id", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", "meeting_id", now(), now()
FROM "cards"
WHERE "meeting_id" IS NOT NULL
ON CONFLICT ("card_id", "meeting_id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "meeting_id";
--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "type_meeting_link";
--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "meeting_id";
--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "state";
--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "date" TYPE timestamptz USING "date" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "objective" SET DEFAULT '';
