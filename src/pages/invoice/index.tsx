import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Invoice } from "@/lib/prisma";
import { faFileInvoice, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Icon } from "@/components/Icon";
import { Button, ButtonStyle } from "@/components/Button";
import Link from "next/link";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Invoices" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const invoicesData = await fetchApi<Invoice[]>({
      table: "invoice",
      relations: {
        projects: true,
        customer: true,
        status: true,
      },
      where: {
        statusId: {
          not: "3f5c10b6-1301-4c0b-8da9-e2515865339e", // PAID
        },
      },
    });
    setInvoices(invoicesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  if (loading) return <Loader />;

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice) => {
    const projectNames = invoice.projects
      .map((p) => p.name)
      .join(" ")
      .toLowerCase();
    const customerName = invoice.customer
      ? `${invoice.customer.firstname} ${invoice.customer.lastname}`.toLowerCase()
      : "";
    const searchLower = searchTerm.toLowerCase();

    return (
      projectNames.includes(searchLower) || customerName.includes(searchLower)
    );
  });

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Invoices</h1>
          <p className={styles.subtitle}>
            Manage and view all open invoices in your dashboard
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <Icon icon={faSearch} />
        <input
          type="text"
          placeholder="Search invoices by project or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Statistics */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <Icon icon={faFileInvoice} />
          <span className={styles.statValue}>{invoices.length}</span>
          <span className={styles.statLabel}>Open Invoices</span>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon={faFileInvoice} />
          <h3>No invoices found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms"
              : "All invoices have been paid or there are no open invoices"}
          </p>
        </div>
      ) : (
        <div className={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className={styles.invoiceCard}>
              <div className={styles.invoiceHeader}>
                <div className={styles.invoiceIcon}>
                  <Icon icon={faFileInvoice} />
                </div>
                <div className={styles.invoiceInfo}>
                  <h3 className={styles.invoiceTitle}>
                    {invoice.projects.map((p) => p.name).join(", ") ||
                      "Untitled Invoice"}
                  </h3>
                  <div className={styles.invoiceMeta}>
                    {invoice.customer && (
                      <span className={styles.customer}>
                        {invoice.customer.firstname} {invoice.customer.lastname}
                      </span>
                    )}
                    {invoice.status && (
                      <span className={styles.status}>
                        Status: {invoice.status.status}
                      </span>
                    )}
                    {invoice.invoiceDate && (
                      <span className={styles.date}>
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.invoiceActions}>
                <Link href={LINKS.invoice.detail.project(invoice.id)}>
                  <Button style={ButtonStyle.Primary}>
                    <Icon icon={faEye} />
                    View Invoice
                  </Button>
                </Link>
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
