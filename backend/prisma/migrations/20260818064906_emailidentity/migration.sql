/*
  Warnings:

  - You are about to drop the column `clerk_user_id` on the `users` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_clerk_user_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "clerk_user_id",
ADD COLUMN     "password_hash" TEXT NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
