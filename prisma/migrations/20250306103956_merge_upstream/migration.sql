/*
  Warnings:

  - The `unitPrice` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "unitPrice",
ADD COLUMN     "unitPrice" DOUBLE PRECISION;
