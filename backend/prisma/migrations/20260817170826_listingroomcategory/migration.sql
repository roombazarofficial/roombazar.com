/*
  Warnings:

  - Added the required column `room_category` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingRoomCategory" AS ENUM ('singleroom', 'sharedroom', 'pgbed', 'hostelbed', 'rk1', 'bhk1', 'bhk2', 'bhk3plus');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "room_category" "ListingRoomCategory" NOT NULL;

-- CreateIndex
CREATE INDEX "listings_city_id_status_room_category_idx" ON "listings"("city_id", "status", "room_category");
