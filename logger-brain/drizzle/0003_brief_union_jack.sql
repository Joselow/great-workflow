CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#f5f5f4' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "project_id" uuid;
--> statement-breakpoint
INSERT INTO "projects" ("id", "user_id", "name", "description", "color", "created_at", "updated_at")
SELECT
	gen_random_uuid(),
	log_users.user_id,
	'Proyecto Default',
	NULL,
	'#f5f5f4',
	now(),
	now()
FROM (
	SELECT DISTINCT "user_id" FROM "logs"
) AS log_users;
--> statement-breakpoint
UPDATE "logs"
SET "project_id" = "projects"."id"
FROM "projects"
WHERE "logs"."user_id" = "projects"."user_id"
	AND "projects"."name" = 'Proyecto Default'
	AND "logs"."project_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "project_id" SET NOT NULL;
