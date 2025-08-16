/*
  Warnings:

  - Added the required column `fileId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Media" ADD COLUMN     "fileId" TEXT NOT NULL;
