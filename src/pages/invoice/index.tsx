import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Customer, Invoice, InvoiceStatus, Project, PrintJob } from "@/lib/prisma";
import { faFileInvoice, faEye, faPlus, faEuroSign, faTrash } from "@fortawesome/free-solid-svg-icons";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Icon } from "@/components/Icon";
import { Button, ButtonStyle } from "@/components/Button";
import Link from "next/link";
import { HierarchicalFilter } from "@/components/HierarchicalFilter";
import { Modal } from "@/components/Modal";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { FormOptionType } from "@/components/Form";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Invoices" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceDate: new Date().toISOString().split("T")[0],
    amount: 0,
    statusId: "",
    customerId: "",
    priceId: "",
  });
  
  // Dropdown data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);

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

  const fetchDropdownData = useCallback(async () => {
    try {
      const [customersData, statusesData, projectsData, printJobsData] = await Promise.all([
        fetchApi<Customer[]>({ table: "customer" }),
        fetchApi<InvoiceStatus[]>({ table: "invoiceStatus" }),
        fetchApi<Project[]>({ table: "project" }),
        fetchApi<PrintJob[]>({ table: "printJob" }),
      ]);
      
      setCustomers(customersData ?? []);
      setStatuses(statusesData ?? []);
      setProjects(projectsData ?? []);
      setPrintJobs(printJobsData ?? []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }, []);

  useEffect(() => {
    void fetchInvoices();
    void fetchDropdownData();
  }, [fetchInvoices, fetchDropdownData]);

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

  const handleCreateInvoice = async () => {
    if (!newInvoice.customerId || !newInvoice.statusId) {
      alert("Please select customer and status");
      return;
    }

    setLoading(true);
    try {
      await fetchApi({
        table: "invoice",
        method: "POST",
        body: {
          invoiceDate: new Date(newInvoice.invoiceDate),
          amount: newInvoice.amount,
          statusId: newInvoice.statusId,
          customerId: newInvoice.customerId,
          priceId: newInvoice.priceId || undefined,
        },
      });

      setShowCreateModal(false);
      setNewInvoice({
        invoiceDate: new Date().toISOString().split("T")[0],
        amount: 0,
        statusId: "",
        customerId: "",
        priceId: "",
      });
      await fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    setLoading(true);
    try {
      await fetchApi({
        table: "invoice",
        id: invoiceId,
        method: "DELETE",
      });
      await fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  if (loading && invoices.length === 0) return <Loader />;

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
          onClick={() => setShowCreateModal(true)}
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
                    <Link href={`/invoice/${invoice.id}`}>
                      <Button style={ButtonStyle.Primary}>
                        <Icon icon={faEye} />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      style={ButtonStyle.Danger}
                    >
                      <Icon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <Modal
          title="Create Invoice"
          onClose={() => setShowCreateModal(false)}
        >
          <div className={styles.modalForm}>
            <div className={styles.formField}>
              <label>Customer *</label>
              <Select
                value={newInvoice.customerId}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, customerId: value })}
                searchable
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.firstname || ""} ${c.lastname || ""}`.trim() || c.email || c.id,
                }))}
              />
            </div>

            <div className={styles.formField}>
              <label>Status *</label>
              <Select
                value={newInvoice.statusId}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, statusId: value })}
                searchable
                options={statuses.map((s) => ({
                  value: s.id,
                  label: s.status,
                }))}
              />
            </div>

            <Field
              label="Invoice Date"
              type={FormOptionType.Date}
              value={newInvoice.invoiceDate}
              onChange={(e) => setNewInvoice({ ...newInvoice, invoiceDate: e.target.value })}
            />

            <Field
              label="Amount"
              type={FormOptionType.Number}
              value={newInvoice.amount.toString()}
              onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) || 0 })}
            />

            <div className={styles.formField}>
              <label>Price Reference (Optional)</label>
              <Select
                value={newInvoice.priceId}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, priceId: value })}
                searchable
                options={[
                  { value: "", label: "None" },
                ]}
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                onClick={() => setShowCreateModal(false)}
                style={ButtonStyle.Secondary}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                style={ButtonStyle.Primary}
                disabled={loading}
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
