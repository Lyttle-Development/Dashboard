import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { ServicePrice, Category } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import {
  faCoins,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonStyle } from "@/components/Button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatCurrency } from "@/lib/invoice";
import { Modal } from "@/components/Modal";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Service Prices" });
  const [loading, setLoading] = useState(false);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ServicePrice>>({});
  const [creating, setCreating] = useState(false);
  const [newData, setNewData] = useState<Partial<ServicePrice>>({
    service: "",
    price: 0,
    categoryId: "",
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [pricesData, categoriesData] = await Promise.all([
      fetchApi<ServicePrice[]>({
        table: "servicePrice",
        relations: { category: true },
      }),
      fetchApi<Category[]>({ table: "category" }),
    ]);
    setServicePrices(pricesData ?? []);
    setCategories(categoriesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!newData.service || !newData.categoryId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/servicePrice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (res.ok) {
        setNewData({ service: "", price: 0, categoryId: "" });
        setCreating(false);
        await fetchData();
      } else {
        alert("Error creating service price");
      }
    } catch (error) {
      alert("Error creating service price");
      console.error(error);
    }
  };

  const handleEdit = (price: ServicePrice) => {
    setEditingId(price.id);
    setEditData(price);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const res = await fetch(`/api/servicePrice/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setEditingId(null);
        setEditData({});
        await fetchData();
      } else {
        alert("Error updating service price");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating service price");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service price?")) return;

    try {
      const res = await fetch(`/api/servicePrice/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert("Error deleting service price");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting service price");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (res.ok) {
        const newCategory = await res.json();
        setCategories([...categories, newCategory]);
        setNewData({ ...newData, categoryId: newCategory.id });
        setNewCategoryName("");
        setShowCategoryModal(false);
      } else {
        alert("Error creating category");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating category");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Service Prices</h1>
          <p className={styles.subtitle}>
            Manage hourly rates, electricity costs, and other service pricing
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)} style={ButtonStyle.Primary}>
            <Icon icon={faPlus} />
            Add Service Price
          </Button>
        )}
      </div>

      {/* Create Form */}
      {creating && (
        <div className={styles.createForm}>
          <h2>Create New Service Price</h2>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Service Name</label>
              <input
                type="text"
                value={newData.service || ""}
                onChange={(e) =>
                  setNewData({ ...newData, service: e.target.value })
                }
                placeholder="e.g., Electricity, Development Hourly Rate"
              />
            </div>
            <div className={styles.formField}>
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={newData.price || 0}
                onChange={(e) =>
                  setNewData({ ...newData, price: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className={styles.formField}>
              <label>Category</label>
              <div className={styles.selectWithAdd}>
                <select
                  value={newData.categoryId || ""}
                  onChange={(e) =>
                    setNewData({ ...newData, categoryId: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setShowCategoryModal(true)}
                  title="Create new category"
                >
                  <Icon icon={faPlus} />
                </Button>
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button onClick={handleCreate} style={ButtonStyle.Primary}>
              <Icon icon={faCheck} />
              Create
            </Button>
            <Button
              onClick={() => {
                setCreating(false);
                setNewData({ service: "", price: 0, categoryId: "" });
              }}
            >
              <Icon icon={faTimes} />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Service Prices List */}
      <div className={styles.pricesList}>
        {servicePrices.map((price) => (
          <div key={price.id} className={styles.priceCard}>
            {editingId === price.id ? (
              <>
                <div className={styles.editForm}>
                  <div className={styles.formField}>
                    <label>Service</label>
                    <input
                      type="text"
                      value={editData.service || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, service: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.price || 0}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Category</label>
                    <select
                      value={editData.categoryId || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, categoryId: e.target.value })
                      }
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button onClick={handleSaveEdit} style={ButtonStyle.Primary}>
                    <Icon icon={faCheck} />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditData({});
                    }}
                  >
                    <Icon icon={faTimes} />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.cardIcon}>
                  <Icon icon={faCoins} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{price.service}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.price}>
                      {formatCurrency(price.price)}
                    </span>
                    {price.category && (
                      <span className={styles.category}>
                        {price.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button onClick={() => handleEdit(price)}>
                    <Icon icon={faEdit} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(price.id)}
                    style={ButtonStyle.Danger}
                  >
                    <Icon icon={faTrash} />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {servicePrices.length === 0 && !creating && (
        <div className={styles.emptyState}>
          <Icon icon={faCoins} />
          <h3>No service prices yet</h3>
          <p>Create your first service price to get started</p>
        </div>
      )}

      {/* Quick Add Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setNewCategoryName("");
        }}
        title="Create New Category"
        size="small"
      >
        <div className={styles.modalContent}>
          <div className={styles.formField}>
            <label>Category Name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Development, Design"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCreateCategory();
                }
              }}
            />
          </div>
          <div className={styles.modalActions}>
            <Button
              onClick={handleCreateCategory}
              style={ButtonStyle.Primary}
            >
              <Icon icon={faCheck} />
              Create Category
            </Button>
            <Button
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategoryName("");
              }}
            >
              <Icon icon={faTimes} />
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
