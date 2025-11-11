import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Button, ButtonStyle } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Icon } from "@/components/Icon";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { LINKS } from "@/links";

export default function CategoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/category/${id}`);
      const data = await response.json();
      setCategory(data);
      setEditName(data.name || "");
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editName.trim()) {
      alert("Name is required");
      return;
    }

    try {
      const response = await fetch(`/api/category/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchCategory();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(LINKS.category.root);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!category) {
    return <div className={styles.container}>Category not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={LINKS.category.root}>
          <Button style={ButtonStyle.Default}>
            <Icon icon={faArrowLeft} /> Back
          </Button>
        </Link>
        <h1>{category.name}</h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowEditModal(true)} style={ButtonStyle.Primary}>
            <Icon icon={faEdit} /> Edit
          </Button>
          <Button onClick={() => setShowDeleteConfirm(true)} style={ButtonStyle.Danger}>
            <Icon icon={faTrash} /> Delete
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h2>Category Details</h2>
          <div className={styles.field}>
            <label>Name</label>
            <p>{category.name}</p>
          </div>
          <div className={styles.field}>
            <label>Created</label>
            <p>{new Date(category.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={styles.field}>
            <label>Updated</label>
            <p>{new Date(category.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {category.tasks && category.tasks.length > 0 && (
          <div className={styles.card}>
            <h2>Related Tasks ({category.tasks.length})</h2>
            <div className={styles.relatedList}>
              {category.tasks.map((task: any) => (
                <Link key={task.id} href={LINKS.task.detail(task.id)} className={styles.relatedItem}>
                  {task.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {category.prices && category.prices.length > 0 && (
          <div className={styles.card}>
            <h2>Related Service Prices ({category.prices.length})</h2>
            <div className={styles.relatedList}>
              {category.prices.map((price: any) => (
                <div key={price.id} className={styles.relatedItem}>
                  {price.service} - €{price.price}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Category" size="small">
        <div className={styles.modalForm}>
          <div className={styles.formField}>
            <label>Name *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Category name"
            />
          </div>
          <div className={styles.modalActions}>
            <Button onClick={handleEdit} style={ButtonStyle.Primary}>Save Changes</Button>
            <Button onClick={() => setShowEditModal(false)} style={ButtonStyle.Default}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Category" size="small">
        <div className={styles.modalForm}>
          <p>Are you sure you want to delete this category? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <Button onClick={handleDelete} style={ButtonStyle.Danger}>Delete</Button>
            <Button onClick={() => setShowDeleteConfirm(false)} style={ButtonStyle.Default}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
