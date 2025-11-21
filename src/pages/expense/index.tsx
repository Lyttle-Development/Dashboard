import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faHandHoldingDollar,
  faPlus,
  faSearch,
  faTrash,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonStyle } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Expense, Customer, ExpenseStatus } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Modal } from "@/components/Modal";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { Select } from "@/components/Select";
import Link from "next/link";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Expenses" });
  
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<ExpenseStatus[]>([]);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: "",
    link: "",
    unitPrice: 0,
    quantity: 1,
    recurring: false,
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const expensesData = await fetchApi<Expense[]>({ 
      table: "expense",
      relations: {
        customer: true,
        status: true,
      }
    });
    setExpenses(expensesData ?? []);
    setLoading(false);
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
    void fetchExpenses();
    void fetchCustomers();
    void fetchStatuses();
  }, [fetchExpenses, fetchCustomers, fetchStatuses]);

  const handleCreate = async () => {
    if (!newExpense.name || !newExpense.statusId) {
      alert("Please fill in expense name and select a status");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchApi<Expense>({
        table: "expense",
        method: "POST",
        body: newExpense,
      });

      if (result) {
        setNewExpense({
          name: "",
          link: "",
          unitPrice: 0,
          quantity: 1,
          recurring: false,
        });
        setIsCreateModalOpen(false);
        await fetchExpenses();
      } else {
        alert("Error creating expense");
      }
    } catch (error) {
      alert("Error creating expense");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setLoading(true);
    try {
      const result = await fetchApi<Expense>({
        table: "expense",
        id,
        method: "DELETE",
      });

      if (result) {
        await fetchExpenses();
      } else {
        alert("Error deleting expense");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting expense");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = expenses.reduce((sum, exp) => sum + ((exp.unitPrice || 0) * (exp.quantity || 0)), 0);
  const paidAmount = expenses
    .filter((exp) => exp.statusId === "2dee2fe0-e126-4ac4-b451-8e75c3316c7b") // Closed/Paid
    .reduce((sum, exp) => sum + ((exp.unitPrice || 0) * (exp.quantity || 0)), 0);

  return (
    <Container>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <Icon icon={faHandHoldingDollar} className={styles.icon} />
            <h1>Expenses</h1>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} style={ButtonStyle.Primary}>
            <Icon icon={faPlus} /> Create Expense
          </Button>
        </div>

        <div className={styles.searchBar}>
          <Icon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{expenses.length}</div>
            <div className={styles.statLabel}>Total Expenses</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>€{totalAmount.toFixed(2)}</div>
            <div className={styles.statLabel}>Total Amount</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>€{paidAmount.toFixed(2)}</div>
            <div className={styles.statLabel}>Paid</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon={faHandHoldingDollar} className={styles.emptyIcon} />
          <h3>No expenses found</h3>
          <p>
            {searchQuery
              ? "No expenses match your search criteria"
              : "Get started by tracking your first expense"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateModalOpen(true)} style={ButtonStyle.Primary}>
              <Icon icon={faPlus} /> Create Expense
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{expense.name}</h3>
                <div className={styles.amount}>€{(((expense.unitPrice || 0) * (expense.quantity || 0)) || 0).toFixed(2)}</div>
              </div>

              <div className={styles.cardMeta}>
                {expense.neededAt && (
                  <span className={styles.badge}>
                    {new Date(expense.neededAt).toLocaleDateString()}
                  </span>
                )}
                {expense.quantity && (
                  <span className={styles.badge}>
                    Qty: {expense.quantity}
                  </span>
                )}
              </div>

              <div className={styles.cardActions}>
                <Link href={LINKS.expense.detail(expense.id)}>
                  <Button>
                    <Icon icon={faEye} />
                  </Button>
                </Link>
                <Button
                  onClick={() => handleDelete(expense.id)}
                  style={ButtonStyle.Danger}
                >
                  <Icon icon={faTrash} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewExpense({
            name: "",
            link: "",
            unitPrice: 0,
            quantity: 1,
            recurring: false,
          });
        }}
        title="Create New Expense"
        size="medium"
      >
        <div className={styles.modalForm}>
          <div className={styles.formGrid}>
            <Field
              label="Name *"
              type={FormOptionType.TEXT}
              value={newExpense.name}
              onChange={(value) =>
                setNewExpense({ ...newExpense, name: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="Link"
              type={FormOptionType.TEXT}
              value={newExpense.link}
              onChange={(value) =>
                setNewExpense({ ...newExpense, link: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="Unit Price"
              type={FormOptionType.NUMBER}
              value={newExpense.unitPrice?.toString() || "0"}
              onChange={(value) =>
                setNewExpense({ ...newExpense, unitPrice: parseFloat(typeof value === "string" ? value : "0") || 0 })
              }
            />
            <Field
              label="Quantity"
              type={FormOptionType.NUMBER}
              value={newExpense.quantity?.toString() || "1"}
              onChange={(value) =>
                setNewExpense({ ...newExpense, quantity: parseInt(typeof value === "string" ? value : "1") || 1 })
              }
            />
            <div className={styles.formField}>
              <label>Customer</label>
              <Select
                value={newExpense.customerId || ""}
                onChange={(value) => setNewExpense({ ...newExpense, customerId: value || null })}
                options={[
                  { value: "", label: "No customer" },
                  ...customers.map(c => ({ value: c.id, label: `${c.firstname} ${c.lastname}` }))
                ]}
              />
            </div>
            <div className={styles.formField}>
              <label>Status *</label>
              <Select
                value={newExpense.statusId || ""}
                onChange={(value) => setNewExpense({ ...newExpense, statusId: value })}
                options={statuses.map(s => ({ value: s.id, label: s.status }))}
              />
            </div>
            <Field
              label="Needed At"
              type={FormOptionType.DATE}
              value={newExpense.neededAt ? new Date(newExpense.neededAt).toISOString().split('T')[0] : ""}
              onChange={(value) =>
                setNewExpense({ ...newExpense, neededAt: value ? new Date(typeof value === "string" ? value : "") : null })
              }
            />
          </div>
          <div className={styles.formActions}>
            <Button onClick={handleCreate} style={ButtonStyle.Primary} disabled={loading}>
              <Icon icon={faPlus} />
              {loading ? "Creating..." : "Create"}
            </Button>
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewExpense({
                  name: "",
                  link: "",
                  unitPrice: 0,
                  quantity: 1,
                  recurring: false,
                });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
