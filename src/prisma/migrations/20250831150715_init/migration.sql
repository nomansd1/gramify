/*
  Warnings:

  - You are about to drop the column `mediaUrl` on the `Story` table. All the data in the column will be lost.
  - Added the required column `fileId` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Story" DROP COLUMN "mediaUrl",
ADD COLUMN     "caption" TEXT DEFAULT '',
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
