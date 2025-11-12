import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faHandHoldingDollar,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonStyle } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Expense } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Expenses" });
  
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const expensesData = await fetchApi<Expense[]>({ table: "expense" });
    setExpenses(expensesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

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
          <Button href={LINKS.expense.create} style={ButtonStyle.Primary}>
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
            <Button href={LINKS.expense.create} style={ButtonStyle.Primary}>
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
                <Button href={LINKS.expense.detail(expense.id)} style={ButtonStyle.Default}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
