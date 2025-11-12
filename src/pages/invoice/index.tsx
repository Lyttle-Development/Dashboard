import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Customer, Invoice, Project } from "@/lib/prisma";
import { faFileInvoice, faEye, faPlus, faEuroSign } from "@fortawesome/free-solid-svg-icons";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Icon } from "@/components/Icon";
import { Button, ButtonStyle } from "@/components/Button";
import Link from "next/link";
import { HierarchicalFilter } from "@/components/HierarchicalFilter";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Invoices" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const invoicesData = await fetchApi<Invoice[]>({
        table: "invoice",
        relations: {
          projects: true,
          printJobs: true,
          customer: true,
          status: true,
        },
      });
      setInvoices(invoicesData ?? []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  // Filter invoices based on selected customer and project
  const filteredInvoices = invoices.filter((invoice) => {
    if (!selectedCustomer) return false;
    if (invoice.customerId !== selectedCustomer.id) return false;
    if (selectedProject) {
      // Check if invoice has this project
      const hasProject = invoice.projects?.some((p) => p.id === selectedProject.id);
      if (!hasProject) return false;
    }
    return true;
  });

  // Calculate total amount for filtered invoices
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const openInvoices = filteredInvoices.filter(
    (inv) => inv.status?.status !== "Paid"
  );

  if (loading) return <Loader />;

  return (
    <Container>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>
            Select customer and optionally a project to view invoices
          </p>
        </div>
        <Button
          href={LINKS.invoice.root}
          style={ButtonStyle.Primary}
        >
          <Icon icon={faPlus} />
          Create Invoice
        </Button>
      </div>

      <HierarchicalFilter
        onCustomerChange={(customer) => {
          setSelectedCustomer(customer);
          setSelectedProject(null);
        }}
        onProjectChange={(project) => setSelectedProject(project)}
        showProjectFilter={true}
      />

      {!selectedCustomer && (
        <div className={styles.emptyState}>
          <Icon icon={faFileInvoice} className={styles.emptyIcon} />
          <h3>Select a Customer</h3>
          <p>Choose a customer above to view their invoices</p>
        </div>
      )}

      {selectedCustomer && filteredInvoices.length === 0 && (
        <div className={styles.emptyState}>
          <Icon icon={faFileInvoice} className={styles.emptyIcon} />
          <h3>No Invoices Found</h3>
          <p>
            {selectedProject
              ? "This project doesn't have any invoices yet"
              : "This customer doesn't have any invoices yet"}
          </p>
        </div>
      )}

      {selectedCustomer && filteredInvoices.length > 0 && (
        <>
          {/* Statistics */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon icon={faFileInvoice} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{filteredInvoices.length}</div>
                <div className={styles.statLabel}>Total Invoices</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon icon={faFileInvoice} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{openInvoices.length}</div>
                <div className={styles.statLabel}>Open Invoices</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon icon={faEuroSign} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>€{totalAmount.toFixed(2)}</div>
                <div className={styles.statLabel}>Total Amount</div>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className={styles.invoicesList}>
            {filteredInvoices.map((invoice) => {
              const isPaid = invoice.status?.status === "Paid";
              return (
                <div key={invoice.id} className={styles.invoiceCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <Icon icon={faFileInvoice} />
                      <span>
                        {invoice.projects?.map((p) => p.name).join(", ") ||
                          invoice.printJobs?.map((pj) => pj.name).join(", ") ||
                          "Invoice"}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${
                        isPaid ? styles.statusPaid : styles.statusOpen
                      }`}
                    >
                      {invoice.status?.status || "Unknown"}
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <strong>Customer:</strong>
                      {invoice.customer?.firstname} {invoice.customer?.lastname}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Date:</strong>
                      {invoice.invoiceDate
                        ? new Date(invoice.invoiceDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Amount:</strong>
                      €{(invoice.amount || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Link href={LINKS.invoice.detail.project(invoice.id)}>
                      <Button style={ButtonStyle.Primary}>
                        <Icon icon={faEye} />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
