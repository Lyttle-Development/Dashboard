import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Customer, Invoice, InvoiceStatus, Project, PrintJob, ServicePrice } from "@/lib/prisma";
import { faFileInvoice, faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Icon } from "@/components/Icon";
import { Button, ButtonStyle } from "@/components/Button";
import { KeyValue } from "@/components/KeyValue";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { FormOptionType } from "@/components/Form";

import styles from "./index.module.scss";

export function Page() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice>>({});
  
  // For edit mode dropdowns
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [prices, setPrices] = useState<ServicePrice[]>([]);

  usePageTitle({ title: invoice ? `Invoice ${invoice.id}` : "Invoice Details" });

  const fetchInvoice = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    
    setLoading(true);
    try {
      const invoiceData = await fetchApi<Invoice>({
        table: "invoice",
        id: id as string,
        relations: {
          customer: true,
          status: true,
          projects: true,
          printJobs: true,
          price: true,
        },
      });
      setInvoice(invoiceData);
      setEditData(invoiceData || {});
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [customersData, statusesData, projectsData, printJobsData, pricesData] = await Promise.all([
        fetchApi<Customer[]>({ table: "customer" }),
        fetchApi<InvoiceStatus[]>({ table: "invoiceStatus" }),
        fetchApi<Project[]>({ table: "project" }),
        fetchApi<PrintJob[]>({ table: "printJob" }),
        fetchApi<ServicePrice[]>({ table: "servicePrice" }),
      ]);
      
      setCustomers(customersData ?? []);
      setStatuses(statusesData ?? []);
      setProjects(projectsData ?? []);
      setPrintJobs(printJobsData ?? []);
      setPrices(pricesData ?? []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }, []);

  useEffect(() => {
    void fetchInvoice();
  }, [fetchInvoice]);

  useEffect(() => {
    if (isEditing && customers.length === 0) {
      void fetchDropdownData();
    }
  }, [isEditing, customers.length, fetchDropdownData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(invoice || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(invoice || {});
  };

  const handleSave = async () => {
    if (!invoice) return;

    setLoading(true);
    try {
      await fetchApi({
        table: "invoice",
        id: invoice.id,
        method: "PUT",
        body: {
          invoiceDate: editData.invoiceDate,
          amount: editData.amount,
          statusId: editData.statusId,
          customerId: editData.customerId,
          priceId: editData.priceId || null,
        },
      });

      await fetchInvoice();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invoice) return <Loader />;
  if (!invoice) return <Container><p>Invoice not found</p></Container>;

  return (
    <Container>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Icon icon={faFileInvoice} />
            Invoice Details
          </h1>
        </div>
        <div className={styles.actions}>
          {!isEditing ? (
            <Button onClick={handleEdit} style={ButtonStyle.Primary}>
              <Icon icon={faEdit} />
              Edit Invoice
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} style={ButtonStyle.Secondary}>
                <Icon icon={faTimes} />
                Cancel
              </Button>
              <Button onClick={handleSave} style={ButtonStyle.Primary} disabled={loading}>
                <Icon icon={faSave} />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Information Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Invoice Information</h2>
        <div className={styles.infoGrid}>
          {!isEditing ? (
            <>
              <KeyValue
                label="Customer"
                value={
                  invoice.customer
                    ? `${invoice.customer.firstname || ""} ${invoice.customer.lastname || ""}`.trim()
                    : "N/A"
                }
              />
              <KeyValue
                label="Status"
                value={invoice.status?.status || "N/A"}
              />
              <KeyValue
                label="Invoice Date"
                value={
                  invoice.invoiceDate
                    ? new Date(invoice.invoiceDate).toLocaleDateString()
                    : "N/A"
                }
              />
              <KeyValue
                label="Amount"
                value={`€${(invoice.amount || 0).toFixed(2)}`}
              />
              <KeyValue
                label="Price Reference"
                value={invoice.price?.id || "None"}
              />
            </>
          ) : (
            <>
              <div className={styles.field}>
                <label>Customer</label>
                <Select
                  value={editData.customerId || ""}
                  onValueChange={(value) => setEditData({ ...editData, customerId: value })}
                  searchable
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.firstname || ""} ${c.lastname || ""}`.trim() || c.email || c.id,
                  }))}
                />
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <Select
                  value={editData.statusId || ""}
                  onValueChange={(value) => setEditData({ ...editData, statusId: value })}
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
                value={editData.invoiceDate ? new Date(editData.invoiceDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setEditData({ ...editData, invoiceDate: new Date(e.target.value) })}
              />
              <Field
                label="Amount"
                type={FormOptionType.Number}
                value={editData.amount?.toString() || ""}
                onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
              />
              <div className={styles.field}>
                <label>Price Reference</label>
                <Select
                  value={editData.priceId || ""}
                  onValueChange={(value) => setEditData({ ...editData, priceId: value || undefined })}
                  searchable
                  options={[
                    { value: "", label: "None" },
                    ...prices.map((p) => ({
                      value: p.id,
                      label: `${p.id}`,
                    })),
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Relations Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Relations</h2>
        
        {/* Projects */}
        <div className={styles.relationGroup}>
          <h3 className={styles.relationTitle}>Projects ({invoice.projects?.length || 0})</h3>
          {invoice.projects && invoice.projects.length > 0 ? (
            <div className={styles.relationList}>
              {invoice.projects.map((project) => (
                <div key={project.id} className={styles.relationCard}>
                  <div className={styles.relationInfo}>
                    <strong>{project.name || project.id}</strong>
                    {project.description && <p>{project.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyRelation}>No projects linked to this invoice</p>
          )}
        </div>

        {/* Print Jobs */}
        <div className={styles.relationGroup}>
          <h3 className={styles.relationTitle}>Print Jobs ({invoice.printJobs?.length || 0})</h3>
          {invoice.printJobs && invoice.printJobs.length > 0 ? (
            <div className={styles.relationList}>
              {invoice.printJobs.map((printJob) => (
                <div key={printJob.id} className={styles.relationCard}>
                  <div className={styles.relationInfo}>
                    <strong>{printJob.name || printJob.id}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyRelation}>No print jobs linked to this invoice</p>
          )}
        </div>
      </div>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
