-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListingStatus" ADD VALUE 'pendingapproval';
ALTER TYPE "ListingStatus" ADD VALUE 'rejected';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModerationActionKind" ADD VALUE 'rejectlisting';
ALTER TYPE "ModerationActionKind" ADD VALUE 'reinstatelisting';
ALTER TYPE "ModerationActionKind" ADD VALUE 'editlisting';
ALTER TYPE "ModerationActionKind" ADD VALUE 'deletelisting';
ALTER TYPE "ModerationActionKind" ADD VALUE 'updateuser';
ALTER TYPE "ModerationActionKind" ADD VALUE 'changerole';
ALTER TYPE "ModerationActionKind" ADD VALUE 'deleteuser';
ALTER TYPE "ModerationActionKind" ADD VALUE 'createcity';
ALTER TYPE "ModerationActionKind" ADD VALUE 'updatecity';
ALTER TYPE "ModerationActionKind" ADD VALUE 'deletecity';
ALTER TYPE "ModerationActionKind" ADD VALUE 'createlocality';
ALTER TYPE "ModerationActionKind" ADD VALUE 'updatelocality';
ALTER TYPE "ModerationActionKind" ADD VALUE 'deletelocality';
ALTER TYPE "ModerationActionKind" ADD VALUE 'createamenity';
ALTER TYPE "ModerationActionKind" ADD VALUE 'updateamenity';
ALTER TYPE "ModerationActionKind" ADD VALUE 'deleteamenity';

-- AlterEnum
ALTER TYPE "PlatformRole" ADD VALUE 'superadmin';

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "approved_at" TIMESTAMPTZ,
ADD COLUMN     "approved_by_user_id" UUID,
ADD COLUMN     "rejected_at" TIMESTAMPTZ,
ADD COLUMN     "rejected_by_user_id" UUID,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "submitted_at" TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "listings_status_submitted_at_idx" ON "listings"("status", "submitted_at");
