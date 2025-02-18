/*
  Warnings:

  - You are about to drop the column `standard` on the `ServicePrice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServicePrice" DROP COLUMN "standard",
ADD COLUMN     "price" DOUBLE PRECISION;
