import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Expense, ExpenseStatusEnum, IntervalEnum, Customer, ExpenseStatus } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Field } from "@/components/Field";
import { FormOptionType, FormValueTypes } from "@/components/Form";
import { Button, ButtonStyle } from "@/components/Button";
import { safeParseFieldDate, safeParseFloat, safeParseInt } from "@/lib/parse";
import { SideToSide } from "@/components/SideToSide";
import { Icon } from "@/components/Icon";
import { faLink, faRotateLeft, faEdit, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link, LinkTarget } from "@/components/Link";
import { useApp } from "@/contexts/App.context";
import { KeyValue } from "@/components/KeyValue";
import { Switch } from "@/components/Switch";
import { LINKS } from "@/links";
import { Preview } from "@/components/Preview";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Select } from "@/components/Select";

export function Page() {
  usePageTitle({ title: "Expense Details" });
  const router = useRouter();
  const { id: expenseId } = router.query;
  const app = useApp();

  const [expense, setExpense] = useState<Expense>(null);
  const [originalExpense, setOriginalExpense] = useState<Expense>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<ExpenseStatus[]>([]);

  // Fetch the expense details by id.
  const fetchExpense = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const expenseData = await fetchApi<Expense>({
        table: "expense",
        id,
        relations: {
          status: true,
          customer: true,
        },
      });

      setExpense(expenseData);
      setOriginalExpense(expenseData);
    } catch (error) {
      console.error("Error fetching expense:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    const customersData = await fetchApi<Customer[]>({ table: "customer" });
    setCustomers(customersData ?? []);
  }, []);

  const fetchStatuses = useCallback(async () => {
    const statusesData = await fetchApi<ExpenseStatus[]>({ table: "expense-status" });
    setStatuses(statusesData ?? []);
  }, []);

  useEffect(() => {
    if (expenseId) {
      void fetchExpense(expenseId as string);
      void fetchCustomers();
      void fetchStatuses();
    }
  }, [expenseId, fetchExpense, fetchCustomers, fetchStatuses]);

  useEffect(() => {
    if (!expense) return;
    void updateExpense();
  }, [expense?.image]);

  const handleChange = (field: string, value: FormValueTypes) => {
    setExpense((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateExpense = async () => {
    setLoading(true);
    try {
      const result = await fetchApi<Expense>({
        table: "expense",
        id: expense.id,
        method: "PUT",
        body: {
          neededAt: expense.neededAt ? new Date(expense.neededAt) : null,
          name: expense.name,
          link: expense.link,
          image: expense.image,
          unitPrice: expense.unitPrice,
          quantity: expense.quantity,
          recurring: expense.recurring,
          recurringInterval: expense.recurringInterval,
          customerId: expense.customerId,
          statusId: expense.statusId,
        },
      });
      if (result) {
        setOriginalExpense(expense);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setExpense(originalExpense);
    setIsEditing(false);
  };

  const deleteExpense = async () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await fetchApi<Expense>({
        table: "expense",
        id: expense.id,
        method: "DELETE",
      });
      void router.push(LINKS.expense.root);
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
  const canAction = app.isOperationsManager; // || app.isManager;

  const requestExpense = async (requested: boolean) => {
    await fetchApi<Expense>({
      table: "expense",
      id: expense.id,
      method: "PUT",
      body: {
        statusId: requested
          ? ExpenseStatusEnum.REQUESTED
          : ExpenseStatusEnum.CREATED,
      },
    });
    await fetchExpense(expenseId as string);
  };

  const approveExpense = async (approved: boolean) => {
    await fetchApi<Expense>({
      table: "expense",
      id: expense.id,
      method: "PUT",
      body: {
        approved,
        statusId: approved
          ? ExpenseStatusEnum.APPROVED
          : ExpenseStatusEnum.REQUESTED,
      },
    });
    await fetchExpense(expenseId as string);
  };

  const setExpenseOrdered = async (ordered: boolean) => {
    await fetchApi<Expense>({
      table: "expense",
      id: expense.id,
      method: "PUT",
      body: {
        orderedAt: ordered ? new Date() : null,
        statusId: ordered
          ? ExpenseStatusEnum.ORDERED
          : ExpenseStatusEnum.APPROVED,
      },
    });
    await fetchExpense(expenseId as string);
  };

  const setExpenseClosed = async (closed: boolean) => {
    await fetchApi<Expense>({
      table: "expense",
      id: expense.id,
      method: "PUT",
      body: {
        statusId: closed
          ? ExpenseStatusEnum.CLOSED
          : ExpenseStatusEnum.REOPENED,
        neededAt: expense.recurring ? new Date() : expense.neededAt,
        orderedAt: expense.recurring ? new Date() : expense.orderedAt,
      },
    });
    await fetchExpense(expenseId as string);
    if (closed) void router.push(LINKS.homepage);
  };

  return (
    <Container>
      <h2 className={styles.title}>
        <span>
          Expense: {expense.name}
          {!!expense.recurring && (
            <Icon icon={faRotateLeft} className={styles.recurring_icon} />
          )}
        </span>
        <article className={styles.actions}>
          <Button onClick={deleteExpense} style={ButtonStyle.Danger}>
            <Icon icon={faTrash} />
            Delete Expense
          </Button>
        </article>
      </h2>
      <SideToSide className={styles.image_splitter}>
        <article className={styles.information}>
          <KeyValue label="Status" value={expense.status.status} />
          {expense.customer && (
            <KeyValue 
              label="Customer" 
              value={`${expense.customer.firstname} ${expense.customer.lastname}`} 
            />
          )}
          <div className={styles.formField}>
            <label>Customer</label>
            <Select
              label="Select Customer"
              value={expense.customerId || "none"}
              onValueChange={(value) => handleChange("customerId", value === "none" ? null : value)}
              options={[
                { value: "none", label: "No customer" },
                ...customers.map(c => ({ value: c.id, label: `${c.firstname} ${c.lastname}` }))
              ]}
            />
          </div>
          <Switch
            label="Recurring"
            checked={expense.recurring}
            onCheckedChange={(value) => handleChange("recurring", value)}
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
          <Field
            label="Name"
            type={FormOptionType.TEXT}
            required
            onChange={(value) => handleChange("name", value)}
            value={expense.name}
          />
          <Field
            label={`Needed At${!expense.neededAt ? " (No date added)" : ""}`}
            type={FormOptionType.DATE}
            onChange={(value) => handleChange("neededAt", value)}
            value={safeParseFieldDate(expense.neededAt)}
          />
          <SideToSide className={styles.side_to_side}>
            <Field
              label="Link"
              type={FormOptionType.TEXT}
              onChange={(value) => handleChange("link", value)}
              value={expense.link}
              className={styles.link}
            />
            <Link
              href={expense.link}
              target={LinkTarget.BLANK}
              className={styles.linkButton}
            >
              <Icon icon={faLink} className={styles.icon} />
              <span>Open Link</span>
            </Link>
          </SideToSide>
          <Field
            label="Unit Price"
            type={FormOptionType.NUMBER}
            onChange={(value) =>
              handleChange("unitPrice", safeParseFloat(value))
            }
            value={expense.unitPrice}
          />
          <Field
            label="Quantity"
            type={FormOptionType.NUMBER}
            onChange={(value) => handleChange("quantity", safeParseInt(value))}
            value={expense.quantity}
          />
        </article>
        <Preview
          link={expense.link}
          image={expense.image}
          onImage={(image) => handleChange("image", image)}
        />
      </SideToSide>
      {hasChanges && <Button onClick={updateExpense}>Update Expense</Button>}
      {!canAction &&
        [ExpenseStatusEnum.CREATED, ExpenseStatusEnum.REQUESTED].includes(
          expense.statusId as ExpenseStatusEnum,
        ) && (
          <Button
            onClick={() =>
              requestExpense(expense.statusId === ExpenseStatusEnum.CREATED)
            }
            style={
              expense.statusId === ExpenseStatusEnum.CREATED
                ? ButtonStyle.Primary
                : ButtonStyle.Danger
            }
          >
            {expense.statusId === ExpenseStatusEnum.CREATED
              ? "Request Expense"
              : "Cancel Request"}
          </Button>
        )}
      {canAction && (
        <SideToSide>
          {expense.statusId !== ExpenseStatusEnum.CLOSED ? (
            <>
              {!expense.approved ? (
                <>
                  <Button
                    onClick={() => approveExpense(true)}
                    style={ButtonStyle.Primary}
                  >
                    Approve Expense
                  </Button>
                  <Button
                    onClick={() => setExpenseClosed(true)}
                    style={ButtonStyle.Danger}
                  >
                    Decline Expense
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => approveExpense(false)}
                    style={ButtonStyle.Danger}
                    disabled={!!expense.orderedAt}
                  >
                    Remove Approval Expense
                  </Button>
                  {!expense.orderedAt ? (
                    <Button
                      onClick={() => setExpenseOrdered(true)}
                      style={ButtonStyle.Primary}
                    >
                      Set as ordered
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setExpenseOrdered(false)}
                        style={ButtonStyle.Danger}
                      >
                        Remove ordered
                      </Button>
                      <Button
                        onClick={() => setExpenseClosed(true)}
                        style={ButtonStyle.Primary}
                      >
                        Close Expense Request
                      </Button>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <Button
              onClick={() => setExpenseClosed(false)}
              style={ButtonStyle.Danger}
            >
              Reopen Expense
            </Button>
          )}
        </SideToSide>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
