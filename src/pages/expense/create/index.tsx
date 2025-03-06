import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { Expense } from "@/lib/prisma";
import { Loader } from "@/components/Loader";

// Optional keys of Expense
interface OptionalExpense {
  neededAt?: Date;
  name: string;
  link: string;
  unitPrice: number;
  quantity: number;
}

const emptyExpense: OptionalExpense = {
  neededAt: null,
  name: "",
  link: "",
  unitPrice: 0,
  quantity: 1,
};

function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState<OptionalExpense>(emptyExpense);

  const restart = () => {
    setExpense(emptyExpense);
  };

  const handleChange = (field: string, value: string | number) => {
    setExpense((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createPrintJob = async () => {
    setLoading(true);
    const data = await fetchApi<Expense>({
      table: "expense",
      method: "POST",
      body: {
        ...expense,
        neededAt: expense.neededAt ? new Date(expense.neededAt) : null,
        statusId: "a2f734b1-613b-4383-b742-a4d5067f0a0c", // Requested
        customerId: "4618597a-b352-45b8-8e70-e38d45c78f0b", // Kilian
      },
    });
    restart();
    setLoading(false);
    void router.push(`/expense/${data.id}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Container>
      <h1 className={styles.title}>
        <span>Create Expense</span>
        <Button onClick={restart}>Restart</Button>
      </h1>
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
        onChange={(value) => handleChange("unitPrice", parseFloat(value))}
        value={expense.unitPrice.toString()}
      />
      <Field
        label="Quantity"
        type={FormOptionType.NUMBER}
        onChange={(value) => handleChange("quantity", parseInt(value))}
        value={expense.quantity.toString()}
      />

      {expense &&
        !!expense.name &&
        !!expense.link &&
        !!expense.unitPrice &&
        !!expense.quantity && (
          <Button onClick={createPrintJob}>Create Expense</Button>
        )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
