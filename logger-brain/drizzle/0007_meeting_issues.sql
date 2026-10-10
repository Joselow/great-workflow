CREATE TABLE "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"color" varchar(7) DEFAULT '#f5f5f4' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "issues" ("meeting_id", "name", "color")
SELECT m."id", TRIM(item->>'title'), '#f5f5f4'
FROM "meetings" m
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(m."agenda", '[]'::jsonb)) AS item
WHERE TRIM(COALESCE(item->>'title', '')) <> '';
--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "agenda";
