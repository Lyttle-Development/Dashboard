import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { Expense, ExpenseStatusEnum, IntervalEnum } from "@/lib/prisma";
import { Loader } from "@/components/Loader";
import { safeParseFloat, safeParseInt } from "@/lib/parse";
import { Switch } from "@/components/Switch";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Select } from "@/components/Select";

// Optional keys of Expense
interface OptionalExpense {
  neededAt?: Date;
  name: string;
  link: string;
  unitPrice: number;
  quantity: number;
  recurring: boolean;
  recurringInterval?: IntervalEnum;
}

const emptyExpense: OptionalExpense = {
  neededAt: null,
  name: "",
  link: "",
  unitPrice: 0,
  quantity: 1,
  recurring: false,
  recurringInterval: null,
};

function Page() {
  usePageTitle({ title: "Create Expense" });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState<OptionalExpense>(emptyExpense);

  const restart = () => {
    setExpense(emptyExpense);
  };

  const handleChange = (field: string, value: boolean | string | number) => {
    console.log(field, value);
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
        statusId: ExpenseStatusEnum.CREATED,
        customerId: "4618597a-b352-45b8-8e70-e38d45c78f0b", // Kilian
      },
    });
    restart();
    setLoading(false);
    void router.push(LINKS.expense.detail(data.id));
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
        onChange={(value) =>
          handleChange("name", typeof value === "string" ? value : "")
        }
        value={expense.name}
      />
      <Field
        label="Needed At"
        type={FormOptionType.DATE}
        onChange={(value) =>
          handleChange("neededAt", typeof value === "string" ? value : "")
        }
      />
      <Field
        label="Link"
        type={FormOptionType.TEXT}
        onChange={(value) =>
          handleChange("link", typeof value === "string" ? value : "")
        }
        value={expense.link}
      />
      <Field
        label="Unit Price"
        type={FormOptionType.NUMBER}
        onChange={(value) => handleChange("unitPrice", safeParseFloat(value))}
        value={expense.unitPrice.toString()}
      />
      <Field
        label="Quantity"
        type={FormOptionType.NUMBER}
        onChange={(value) => handleChange("quantity", safeParseInt(value))}
        value={expense.quantity.toString()}
      />
      <Switch
        label="Recurring"
        onCheckedChange={(value) => handleChange("recurring", value)}
        checked={expense.recurring}
      />
      {expense.recurring && (
        <Select
          label="Select Interval"
          options={(Object.values(IntervalEnum) as string[]).map(
            (interval) => ({
              label: interval,
              value: interval,
            }),
          )}
          onValueChange={(value) =>
            handleChange(
              "recurringInterval",
              typeof value === "string" ? value : "",
            )
          }
          value={expense.recurringInterval?.toString()}
          searchable
        />
      )}

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
