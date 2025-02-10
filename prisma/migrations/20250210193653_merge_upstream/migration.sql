/*
  Warnings:

  - Changed the type of `category` on the `ServicePrice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `service` on the `ServicePrice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `serviceType` on the `TimeLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `TimeLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ServicePrice" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
DROP COLUMN "service",
ADD COLUMN     "service" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TimeLog" DROP COLUMN "serviceType",
ADD COLUMN     "serviceType" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ServiceCategory";

-- DropEnum
DROP TYPE "ServiceType";
