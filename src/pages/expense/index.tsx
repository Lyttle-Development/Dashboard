import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faHandHoldingDollar,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Expense } from "@/lib/prisma";
import { SideToSide } from "@/components/SideToSide";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Expenses" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const expensesData = await fetchApi<Expense[]>({
      table: "expense",
      where: {
        statusId: {
          not: "2dee2fe0-e126-4ac4-b451-8e75c3316c7b", // Closed
        },
      },
    });
    setExpenses(expensesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  if (loading) return <Loader />;

  return (
    <Container>
      <h1>Expenses</h1>

      <SideToSide>
        <Select
          label="Select Expense"
          icon={faMagnifyingGlass}
          options={
            expenses && expenses.length
              ? expenses.map((expense) => ({
                  label: expense.name,
                  value: expense.id,
                }))
              : []
          }
          onValueChange={(expenseId) =>
            router.push(LINKS.expense.detail(expenseId))
          }
          disabled={!(expenses && expenses.length)}
        />
        <Button href={LINKS.expense.create}>
          <Icon icon={faHandHoldingDollar}>Create Expense</Icon>
        </Button>
      </SideToSide>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
