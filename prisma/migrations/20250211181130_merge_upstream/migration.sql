/*
  Warnings:

  - You are about to drop the column `suggestedPrice` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `PrintJob` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PrintJob" DROP COLUMN "suggestedPrice",
DROP COLUMN "totalPrice",
ALTER COLUMN "printTime" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL;
