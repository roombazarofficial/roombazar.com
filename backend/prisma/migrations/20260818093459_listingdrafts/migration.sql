-- CreateTable
CREATE TABLE "listing_drafts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "listing_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listing_drafts_user_id_key" ON "listing_drafts"("user_id");

-- AddForeignKey
ALTER TABLE "listing_drafts" ADD CONSTRAINT "listing_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
