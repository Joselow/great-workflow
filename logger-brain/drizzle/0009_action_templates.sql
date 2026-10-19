CREATE TABLE "action_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"card_id" uuid,
	"module" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"action" text,
	"template" text DEFAULT '' NOT NULL,
	"color" varchar(7) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "action_templates_user_id_module_idx" ON "action_templates" USING btree ("user_id","module");