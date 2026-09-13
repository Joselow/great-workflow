CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" uuid,
	"meeting_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" varchar(7) DEFAULT '#f5f5f4' NOT NULL,
	"is_prompt" boolean DEFAULT false NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
