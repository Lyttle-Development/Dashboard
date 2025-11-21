import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faTag, faPlus, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button, ButtonStyle } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { ServicePrice, Category } from "@/lib/prisma";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Modal } from "@/components/Modal";
import { Field, FormOptionType } from "@/components/Form";
import { Select } from "@/components/Select";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Prices" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPrice, setNewPrice] = useState({
    service: "",
    price: 0,
    categoryId: "",
    description: "",
    notes: "",
    interval: "",
  });

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    const pricesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      relations: { category: true },
    });
    setPrices(pricesData || []);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData || []);
  }, []);

  useEffect(() => {
    void fetchPrices();
    void fetchCategories();
  }, [fetchPrices, fetchCategories]);

  const handleCreatePrice = async () => {
    setLoading(true);
    await fetchApi({
      method: "POST",
      table: "servicePrice",
      body: newPrice,
    });
    await fetchPrices();
    setShowCreateModal(false);
    setNewPrice({
      service: "",
      price: 0,
      categoryId: "",
      description: "",
      notes: "",
      interval: "",
    });
    setLoading(false);
  };

  const handleDeletePrice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this price?")) return;
    setLoading(true);
    await fetchApi({
      method: "DELETE",
      table: "servicePrice",
      id,
    });
    await fetchPrices();
    setLoading(false);
  };

  // Filter prices
  const filteredPrices = prices.filter((price) => {
    const matchesCategory = !filterCategoryId || price.categoryId === filterCategoryId;
    const matchesSearch =
      !searchQuery ||
      price.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryOptions: FormOptionType[] = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const intervalOptions: FormOptionType[] = [
    { value: "", label: "Select Interval" },
    { value: "ONE_TIME", label: "One Time" },
    { value: "HOURLY", label: "Hourly" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  if (loading) return <Loader />;

  return (
    <Container>
      <div className={styles.header}>
        <h1>
          <Icon icon={faTag}>Prices</Icon>
        </h1>
        <Button style={ButtonStyle.PRIMARY} onClick={() => setShowCreateModal(true)}>
          <Icon icon={faPlus}>Create Price</Icon>
        </Button>
      </div>

      <div className={styles.filters}>
        <Field
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by service or description..."
        />
        <Select
          label="Filter by Category"
          value={filterCategoryId}
          onValueChange={setFilterCategoryId}
          options={categoryOptions}
          searchable
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Prices</span>
          <span className={styles.statValue}>{filteredPrices.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Categories</span>
          <span className={styles.statValue}>{categories.length}</span>
        </div>
      </div>

      <div className={styles.priceList}>
        {filteredPrices.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No prices found</p>
            {(filterCategoryId || searchQuery) && (
              <p>Try adjusting your filters</p>
            )}
          </div>
        ) : (
          filteredPrices.map((price) => (
            <div key={price.id} className={styles.priceCard}>
              <div className={styles.priceInfo}>
                <h3>{price.service || "Unnamed Service"}</h3>
                <p className={styles.category}>{price.category?.name || "No Category"}</p>
                <p className={styles.description}>{price.description || "No description"}</p>
                <div className={styles.priceDetails}>
                  <span className={styles.amount}>
                    €{price.price?.toFixed(2) || "0.00"}
                  </span>
                  {price.interval && (
                    <span className={styles.interval}>{price.interval}</span>
                  )}
                </div>
              </div>
              <div className={styles.priceActions}>
                <Button
                  style={ButtonStyle.INFO}
                  onClick={() => router.push(`/price/${price.id}`)}
                >
                  <Icon icon={faEye}>View</Icon>
                </Button>
                <Button
                  style={ButtonStyle.DANGER}
                  onClick={() => handleDeletePrice(price.id)}
                >
                  <Icon icon={faTrash}>Delete</Icon>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Price Modal */}
      <Modal
        show={showCreateModal}
        title="Create New Price"
        onClose={() => setShowCreateModal(false)}
      >
        <div className={styles.modalForm}>
          <Field
            label="Service Name"
            value={newPrice.service}
            onChange={(e) => setNewPrice({ ...newPrice, service: e.target.value })}
            required
          />
          <Field
            label="Price"
            type="number"
            step="0.01"
            value={newPrice.price.toString()}
            onChange={(e) =>
              setNewPrice({ ...newPrice, price: parseFloat(e.target.value) || 0 })
            }
            required
          />
          <Select
            label="Category"
            value={newPrice.categoryId}
            onValueChange={(value) => setNewPrice({ ...newPrice, categoryId: value })}
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            searchable
          />
          <Select
            label="Interval"
            value={newPrice.interval}
            onValueChange={(value) => setNewPrice({ ...newPrice, interval: value })}
            options={intervalOptions}
            searchable
          />
          <Field
            label="Description"
            value={newPrice.description}
            onChange={(e) => setNewPrice({ ...newPrice, description: e.target.value })}
          />
          <Field
            label="Notes"
            value={newPrice.notes}
            onChange={(e) => setNewPrice({ ...newPrice, notes: e.target.value })}
          />
          <div className={styles.modalActions}>
            <Button style={ButtonStyle.SUCCESS} onClick={handleCreatePrice}>
              Create Price
            </Button>
            <Button
              style={ButtonStyle.SECONDARY}
              onClick={() => setShowCreateModal(false)}
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
