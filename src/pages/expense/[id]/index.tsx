import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Expense } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Field } from "@/components/Field";
import { FormOptionType, FormValueTypes } from "@/components/Form";
import { Button, ButtonStyle } from "@/components/Button";
import { safeParseFieldDate, safeParseFloat, safeParseInt } from "@/lib/parse";

export function Page() {
  const router = useRouter();
  const { id: expenseId } = router.query;

  const [expense, setExpense] = useState<Expense>(null);
  const [originalExpense, setOriginalExpense] = useState<Expense>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the expense details by id.
  const fetchExpense = useCallback(async (id: string) => {
    setLoading(true);
    const expenseData = await fetchApi<Expense>({
      table: "expense",
      id,
      relations: {
        status: true,
      },
    });

    setExpense(expenseData);
    setOriginalExpense(expenseData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (expenseId) {
      void fetchExpense(expenseId as string);
    }
  }, []);

  const handleChange = (field: string, value: FormValueTypes) => {
    setExpense((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateExpense = async () => {
    await fetchApi<Expense>({
      table: "expense",
      id: expense.id,
      method: "PUT",
      body: {
        neededAt: expense.neededAt ? new Date(expense.neededAt) : null,
        name: expense.name,
        link: expense.link,
        unitPrice: expense.unitPrice,
        quantity: expense.quantity,
      },
    });
    setExpense(expense);
    setOriginalExpense(expense);
  };

  const deleteExpense = async () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await fetchApi<Expense>({
        table: "expense",
        id: expense.id,
        method: "DELETE",
      });
      void router.push("/expense");
    }
  };

  const changes = Object.keys(expense ?? {}).reduce((acc, key) => {
    if (expense[key] !== originalExpense[key]) {
      acc[key] = expense[key];
    }
    return acc;
  }, {});
  const hasChanges = Object.keys(changes).length > 0;

  if (loading) return <Loader />;
  if (!expense) return <div>Expense not found</div>;

  return (
    <Container>
      <h2 className={styles.expense_title}>
        <span>Expense: {expense.name}</span>
        <Button onClick={deleteExpense} style={ButtonStyle.Danger}>
          Delete Expense
        </Button>
      </h2>
      <article className={styles.information}>
        <Field
          label="Name"
          type={FormOptionType.TEXT}
          required
          onChange={(value) => handleChange("name", value)}
          value={expense.name}
        />
        <Field
          label="Needed At"
          type={FormOptionType.DATE}
          onChange={(value) => handleChange("neededAt", value)}
          value={safeParseFieldDate(expense.neededAt)}
        />
        <Field
          label="Link"
          type={FormOptionType.TEXT}
          onChange={(value) => handleChange("link", value)}
          value={expense.link}
        />
        <Field
          label="Unit Price"
          type={FormOptionType.NUMBER}
          onChange={(value) => handleChange("unitPrice", safeParseFloat(value))}
          value={expense.unitPrice}
        />
        <Field
          label="Quantity"
          type={FormOptionType.NUMBER}
          onChange={(value) => handleChange("quantity", safeParseInt(value))}
          value={expense.quantity}
        />
      </article>
      {hasChanges && <Button onClick={updateExpense}>Update Expense</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
