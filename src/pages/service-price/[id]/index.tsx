import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Button, ButtonStyle } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Icon } from "@/components/Icon";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { LINKS } from "@/links";

export default function ServicePriceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [price, setPrice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [editService, setEditService] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchPrice();
      fetchCategories();
    }
  }, [id]);

  const fetchPrice = async () => {
    try {
      const response = await fetch(`/api/service-price/${id}`);
      const data = await response.json();
      setPrice(data);
      setEditService(data.service || "");
      setEditPrice(data.price?.toString() || "");
      setEditDescription(data.description || "");
      setEditCategoryId(data.categoryId || "");
    } catch (error) {
      console.error("Error fetching price:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/service-price/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: editService,
          price: parseFloat(editPrice) || 0,
          description: editDescription,
          categoryId: editCategoryId || null,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchPrice();
      }
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/service-price/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(LINKS.servicePrice.root);
      }
    } catch (error) {
      console.error("Error deleting price:", error);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!price) {
    return <div className={styles.container}>Service Price not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={LINKS.servicePrice.root}>
          <Button style={ButtonStyle.Default}>
            <Icon icon={faArrowLeft} /> Back
          </Button>
        </Link>
        <h1>{price.service}</h1>
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
          <h2>Price Details</h2>
          <div className={styles.field}>
            <label>Service</label>
            <p>{price.service}</p>
          </div>
          <div className={styles.field}>
            <label>Price</label>
            <p>€{price.price?.toFixed(2)}</p>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <p>{price.description || "No description"}</p>
          </div>
          {price.category && (
            <div className={styles.field}>
              <label>Category</label>
              <p>{price.category.name}</p>
            </div>
          )}
          <div className={styles.field}>
            <label>Created</label>
            <p>{new Date(price.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={styles.field}>
            <label>Updated</label>
            <p>{new Date(price.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Service Price">
        <div className={styles.modalForm}>
          <div className={styles.formField}>
            <label>Service *</label>
            <input type="text" value={editService} onChange={(e) => setEditService(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label>Price *</label>
            <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label>Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
          </div>
          <div className={styles.formField}>
            <label>Category</label>
            <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button onClick={handleEdit} style={ButtonStyle.Primary}>Save Changes</Button>
            <Button onClick={() => setShowEditModal(false)} style={ButtonStyle.Default}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Service Price" size="small">
        <div className={styles.modalForm}>
          <p>Are you sure you want to delete this service price? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <Button onClick={handleDelete} style={ButtonStyle.Danger}>Delete</Button>
            <Button onClick={() => setShowDeleteConfirm(false)} style={ButtonStyle.Default}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
