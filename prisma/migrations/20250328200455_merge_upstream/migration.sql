-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "recurringInterval" TEXT;

-- CreateTable
CREATE TABLE "SubscriptionStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "link" TEXT,
    "image" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "quantity" INTEGER,
    "interval" TEXT,
    "customerId" TEXT,
    "statusId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionStatus_status_key" ON "SubscriptionStatus"("status");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "SubscriptionStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
