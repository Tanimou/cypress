 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_price_id_prices_id_fk" FOREIGN KEY ("price_id") REFERENCES "prices"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
-- ALTER TABLE "subscriptions" ADD COLUMN "cancel_at" timestamp with time zone DEFAULT now();