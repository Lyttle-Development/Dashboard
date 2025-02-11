/*
  Warnings:

  - The values [Resin] on the enum `PrintType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `client` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedMax` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedMin` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `TimeLog` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `TimeLog` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `TimeLog` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `TimeLog` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `statusId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PrintJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PrintType_new" AS ENUM ('FDM', 'SLA');
ALTER TABLE "PrintJob" ALTER COLUMN "printType" TYPE "PrintType_new" USING ("printType"::text::"PrintType_new");
ALTER TYPE "PrintType" RENAME TO "PrintType_old";
ALTER TYPE "PrintType_new" RENAME TO "PrintType";
DROP TYPE "PrintType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TimeLog" DROP CONSTRAINT "TimeLog_projectId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PrintJob" DROP COLUMN "color",
DROP COLUMN "product",
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "scheduledDate" DROP NOT NULL,
ALTER COLUMN "completed" DROP NOT NULL,
ALTER COLUMN "ordered" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "printType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PrintMaterial" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "client",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "priceId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ServicePrice" DROP COLUMN "category",
DROP COLUMN "estimatedMax",
DROP COLUMN "estimatedMin",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "friends" DOUBLE PRECISION,
ADD COLUMN     "standard" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "standardMin" DROP NOT NULL,
ALTER COLUMN "standardMax" DROP NOT NULL,
ALTER COLUMN "friendsMin" DROP NOT NULL,
ALTER COLUMN "friendsMax" DROP NOT NULL,
ALTER COLUMN "service" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TimeLog" DROP COLUMN "category",
DROP COLUMN "hourlyRate",
DROP COLUMN "serviceType",
DROP COLUMN "totalPrice",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "projectId" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL;

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "InvoiceStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceStatus_status_key" ON "InvoiceStatus"("status");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "InvoiceStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "ServicePrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePrice" ADD CONSTRAINT "ServicePrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
