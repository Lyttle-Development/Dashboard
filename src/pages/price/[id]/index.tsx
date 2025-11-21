import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { ServicePrice, Category, Project, PrintJob, Invoice } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button, ButtonStyle } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Field, FormOptionType } from "@/components/Form";
import { Select } from "@/components/Select";
import { KeyValue } from "@/components/KeyValue";
import { usePageTitle } from "@/hooks/usePageTitle";
import styles from "./index.module.scss";

export function Page() {
  const router = useRouter();
  const priceId = router.query.id as string;
  usePageTitle({ title: "Price Details" });

  const [price, setPrice] = useState<ServicePrice | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form state
  const [editData, setEditData] = useState<Partial<ServicePrice>>({});

  // Fetch price details
  const fetchPrice = useCallback(async (id: string) => {
    setLoading(true);
    const priceData = await fetchApi<ServicePrice>({
      table: "servicePrice",
      id,
      relations: {
        category: true,
        projects: true,
        printJobs: true,
        Invoice: true,
      },
    });
    setPrice(priceData);
    setEditData(priceData);
    setLoading(false);
  }, []);

  // Fetch categories for dropdown
  const fetchCategories = useCallback(async () => {
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData || []);
  }, []);

  useEffect(() => {
    if (priceId) {
      void fetchPrice(priceId);
      void fetchCategories();
    }
  }, [priceId, fetchPrice, fetchCategories]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(price);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(price);
  };

  const handleSave = async () => {
    setLoading(true);
    await fetchApi({
      method: "PUT",
      table: "servicePrice",
      id: priceId,
      body: {
        service: editData.service,
        price: editData.price,
        categoryId: editData.categoryId,
        description: editData.description,
        notes: editData.notes,
        interval: editData.interval,
      },
    });
    await fetchPrice(priceId);
    setIsEditing(false);
    setLoading(false);
  };

  if (loading) return <Loader />;
  if (!price) return <div>Price not found</div>;

  const categoryOptions: FormOptionType[] = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const intervalOptions: FormOptionType[] = [
    { value: "ONE_TIME", label: "One Time" },
    { value: "HOURLY", label: "Hourly" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  return (
    <Container>
      <div className={styles.header}>
        <h1 className={styles.title}>{price.service || "Unnamed Price"}</h1>
        {!isEditing ? (
          <Button style={ButtonStyle.INFO} onClick={handleEdit}>
            <Icon icon={faEdit}>Edit</Icon>
          </Button>
        ) : (
          <div className={styles.editActions}>
            <Button style={ButtonStyle.SUCCESS} onClick={handleSave}>
              <Icon icon={faSave}>Save</Icon>
            </Button>
            <Button style={ButtonStyle.SECONDARY} onClick={handleCancel}>
              <Icon icon={faTimes}>Cancel</Icon>
            </Button>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Price Information</h2>
        <div className={styles.infoGrid}>
          {!isEditing ? (
            <>
              <KeyValue label="Service" value={price.service || "N/A"} />
              <KeyValue
                label="Price"
                value={price.price != null ? `€${price.price.toFixed(2)}` : "N/A"}
              />
              <KeyValue
                label="Category"
                value={price.category?.name || "No category"}
              />
              <KeyValue label="Interval" value={price.interval || "N/A"} />
              <KeyValue label="Description" value={price.description || "N/A"} />
              <KeyValue label="Notes" value={price.notes || "N/A"} />
            </>
          ) : (
            <>
              <Field
                label="Service"
                value={editData.service || ""}
                onChange={(e) =>
                  setEditData({ ...editData, service: e.target.value })
                }
              />
              <Field
                label="Price"
                type="number"
                step="0.01"
                value={editData.price?.toString() || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Select
                label="Category"
                value={editData.categoryId || ""}
                onValueChange={(value) =>
                  setEditData({ ...editData, categoryId: value })
                }
                options={categoryOptions}
                searchable
              />
              <Select
                label="Interval"
                value={editData.interval || ""}
                onValueChange={(value) =>
                  setEditData({ ...editData, interval: value })
                }
                options={intervalOptions}
                searchable
              />
              <Field
                label="Description"
                value={editData.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />
              <Field
                label="Notes"
                value={editData.notes || ""}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
              />
            </>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Relations</h2>

        <div className={styles.relationSection}>
          <h3>Projects ({price.projects?.length || 0})</h3>
          {price.projects && price.projects.length > 0 ? (
            <div className={styles.relationList}>
              {price.projects.map((project: Project) => (
                <div key={project.id} className={styles.relationCard}>
                  <div className={styles.relationInfo}>
                    <strong>{project.name}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No projects using this price</p>
          )}
        </div>

        <div className={styles.relationSection}>
          <h3>Print Jobs ({price.printJobs?.length || 0})</h3>
          {price.printJobs && price.printJobs.length > 0 ? (
            <div className={styles.relationList}>
              {price.printJobs.map((printJob: PrintJob) => (
                <div key={printJob.id} className={styles.relationCard}>
                  <div className={styles.relationInfo}>
                    <strong>{printJob.name}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No print jobs using this price</p>
          )}
        </div>

        <div className={styles.relationSection}>
          <h3>Invoices ({price.Invoice?.length || 0})</h3>
          {price.Invoice && price.Invoice.length > 0 ? (
            <div className={styles.relationList}>
              {price.Invoice.map((invoice: Invoice) => (
                <div key={invoice.id} className={styles.relationCard}>
                  <div className={styles.relationInfo}>
                    <strong>Invoice #{invoice.id.substring(0, 8)}</strong>
                    <span>Amount: €{invoice.amount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No invoices using this price</p>
          )}
        </div>
      </div>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
