ALTER TABLE "files" ADD CONSTRAINT "UQ_files_url" UNIQUE("url");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "UQ_files_original_url" UNIQUE("original_url");