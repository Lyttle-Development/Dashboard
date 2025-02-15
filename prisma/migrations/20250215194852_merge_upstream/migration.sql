-- AlterTable
ALTER TABLE "PrintJob" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "servicePriceId" TEXT;

-- AlterTable
ALTER TABLE "TimeLog" ADD COLUMN     "printJobId" TEXT;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_servicePriceId_fkey" FOREIGN KEY ("servicePriceId") REFERENCES "ServicePrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "PrintJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
