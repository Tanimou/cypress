ALTER TABLE "files" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "folder_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "data" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "in_trash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "banner_url" DROP NOT NULL;