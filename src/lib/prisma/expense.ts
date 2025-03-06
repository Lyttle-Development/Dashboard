import prisma from "@/lib/prisma/index";
import { ExpenseStatus } from "@/pages/expense/[id]";

export async function reopenRecurringExpenses() {
  // Set all recurring expenses to open where the recurring is enabled and the orderedAt < current months first day
  return prisma.expense.updateMany({
    where: {
      recurring: true,
      orderedAt: {
        lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    data: {
      statusId: ExpenseStatus.APPROVED,
    },
  });
}
