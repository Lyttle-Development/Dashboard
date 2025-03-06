-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "neededAt" TIMESTAMP(3),
    "link" TEXT,
    "unitPrice" TEXT,
    "quantity" INTEGER,
    "approved" BOOLEAN DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "orderedAt" TIMESTAMP(3),
    "statusId" TEXT NOT NULL,
    "customerId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expenseStatusId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseStatus_status_key" ON "ExpenseStatus"("status");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "InvoiceStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_expenseStatusId_fkey" FOREIGN KEY ("expenseStatusId") REFERENCES "ExpenseStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
