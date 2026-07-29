CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"meeting_id" uuid,
	"type_meeting_link" integer,
	"description" text NOT NULL,
	"responsible" varchar(100) NOT NULL,
	"tags" varchar(255) NOT NULL,
	"completed" boolean,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"estimated_duration" integer NOT NULL,
	"state" text NOT NULL,
	"objective" varchar(255) NOT NULL,
	"summary" text,
	"lessons" text,
	"executed" boolean DEFAULT false NOT NULL,
	"objective_achieved" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20) NOT NULL
);
