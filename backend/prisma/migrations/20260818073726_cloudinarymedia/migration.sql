/*
  Warnings:

  - Added the required column `secure_url` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('image', 'video');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "duration_seconds" DOUBLE PRECISION,
ADD COLUMN     "format" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "kind" "MediaKind" NOT NULL DEFAULT 'image',
ADD COLUMN     "secure_url" TEXT NOT NULL,
ALTER COLUMN "exif_stripped" SET DEFAULT true;
