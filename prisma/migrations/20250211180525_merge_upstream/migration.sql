/*
  Warnings:

  - You are about to drop the column `printType` on the `PrintJob` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PrintJob" DROP COLUMN "printType";

-- DropEnum
DROP TYPE "PrintType";
