/*
  Warnings:

  - You are about to drop the column `expenseStatusId` on the `Expense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_expenseStatusId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_statusId_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "expenseStatusId";

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ExpenseStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
