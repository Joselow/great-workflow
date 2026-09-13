ALTER TABLE "cards" ADD COLUMN "fl_meeting" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "cards_user_id_updated_at_idx" ON "cards" USING btree ("user_id","updated_at");