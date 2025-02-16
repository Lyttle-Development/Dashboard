/*
  Warnings:

  - You are about to drop the column `servicePriceId` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrintJob" DROP CONSTRAINT "PrintJob_servicePriceId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- AlterTable
ALTER TABLE "PrintJob" DROP COLUMN "servicePriceId",
ADD COLUMN     "priceId" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "clientId",
ADD COLUMN     "customerId" TEXT;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "ServicePrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
