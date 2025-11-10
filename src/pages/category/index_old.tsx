import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Category } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import {
  faFolder,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonStyle } from "@/components/Button";
import { usePageTitle } from "@/hooks/usePageTitle";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Categories" });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Category>>({});
  const [creating, setCreating] = useState(false);
  const [newData, setNewData] = useState<Partial<Category>>({ name: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const categoriesData = await fetchApi<Category[]>({ table: "category" });
    setCategories(categoriesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!newData.name) {
      alert("Please enter a category name");
      return;
    }

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (res.ok) {
        setNewData({ name: "" });
        setCreating(false);
        await fetchData();
      } else {
        alert("Error creating category");
      }
    } catch (error) {
      alert("Error creating category");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditData(category);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const res = await fetch(`/api/category/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setEditingId(null);
        setEditData({});
        await fetchData();
      } else {
        alert("Error updating category");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert("Error deleting category");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting category");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p className={styles.subtitle}>
            Organize tasks, prices, and other items by category
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)} style={ButtonStyle.Primary}>
            <Icon icon={faPlus} />
            Add Category
          </Button>
        )}
      </div>

      {/* Create Form */}
      {creating && (
        <div className={styles.createForm}>
          <h2>Create New Category</h2>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label>Category Name</label>
              <input
                type="text"
                value={newData.name || ""}
                onChange={(e) =>
                  setNewData({ ...newData, name: e.target.value })
                }
                placeholder="e.g., Development, Design, Support"
                autoFocus
              />
            </div>
            <div className={styles.formActions}>
              <Button onClick={handleCreate} style={ButtonStyle.Primary}>
                <Icon icon={faCheck} />
                Create
              </Button>
              <Button
                onClick={() => {
                  setCreating(false);
                  setNewData({ name: "" });
                }}
              >
                <Icon icon={faTimes} />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            {editingId === category.id ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  autoFocus
                />
                <div className={styles.cardActions}>
                  <Button onClick={handleSaveEdit} style={ButtonStyle.Primary}>
                    <Icon icon={faCheck} />
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditData({});
                    }}
                  >
                    <Icon icon={faTimes} />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.cardIcon}>
                  <Icon icon={faFolder} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{category.name}</h3>
                </div>
                <div className={styles.cardActions}>
                  <Button onClick={() => handleEdit(category)}>
                    <Icon icon={faEdit} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(category.id)}
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

      {categories.length === 0 && !creating && (
        <div className={styles.emptyState}>
          <Icon icon={faFolder} />
          <h3>No categories yet</h3>
          <p>Create your first category to get started</p>
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
