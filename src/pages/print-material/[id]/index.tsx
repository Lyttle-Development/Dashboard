import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Icon } from "@/components/Icon";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { LINKS } from "@/links";

export default function PrintMaterialDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [editType, setEditType] = useState("");
  const [editSubType, setEditSubType] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const response = await fetch(`/api/print-material/${id}`);
      const data = await response.json();
      setMaterial(data);
      setEditType(data.type || "");
      setEditSubType(data.subType || "");
      setEditColor(data.color || "");
      setEditStock(data.stock?.toString() || "");
      setEditUnitPrice(data.unitPrice?.toString() || "");
    } catch (error) {
      console.error("Error fetching material:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/print-material/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editType,
          subType: editSubType,
          color: editColor,
          stock: parseFloat(editStock) || 0,
          unitPrice: parseFloat(editUnitPrice) || 0,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchMaterial();
      }
    } catch (error) {
      console.error("Error updating material:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/print-material/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(LINKS.printMaterial.root);
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!material) {
    return <div className={styles.container}>Print Material not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={LINKS.printMaterial.root}>
          <Button variant="secondary">
            <Icon icon={faArrowLeft} /> Back
          </Button>
        </Link>
        <h1>{material.subType} - {material.color}</h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowEditModal(true)} variant="primary">
            <Icon icon={faEdit} /> Edit
          </Button>
          <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">
            <Icon icon={faTrash} /> Delete
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h2>Material Details</h2>
          <div className={styles.field}>
            <label>Type</label>
            <p>{material.type}</p>
          </div>
          <div className={styles.field}>
            <label>Sub Type</label>
            <p>{material.subType}</p>
          </div>
          <div className={styles.field}>
            <label>Color</label>
            <p>{material.color}</p>
          </div>
          <div className={styles.field}>
            <label>Stock</label>
            <p>{material.stock}g</p>
          </div>
          <div className={styles.field}>
            <label>Unit Price</label>
            <p>€{material.unitPrice?.toFixed(4)}/g</p>
          </div>
          <div className={styles.field}>
            <label>Created</label>
            <p>{new Date(material.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={styles.field}>
            <label>Updated</label>
            <p>{new Date(material.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Print Material">
        <div className={styles.modalForm}>
          <div className={styles.formField}>
            <label>Type *</label>
            <input type="text" value={editType} onChange={(e) => setEditType(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label>Sub Type *</label>
            <input type="text" value={editSubType} onChange={(e) => setEditSubType(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label>Color *</label>
            <input type="text" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label>Stock (grams) *</label>
            <input type="number" step="0.01" value={editStock} onChange={(e) => setEditStock(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label>Unit Price (per gram) *</label>
            <input type="number" step="0.0001" value={editUnitPrice} onChange={(e) => setEditUnitPrice(e.target.value)} />
          </div>
          <div className={styles.modalActions}>
            <Button onClick={handleEdit} variant="primary">Save Changes</Button>
            <Button onClick={() => setShowEditModal(false)} variant="secondary">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Print Material" size="small">
        <div className={styles.modalForm}>
          <p>Are you sure you want to delete this material? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <Button onClick={handleDelete} variant="danger">Delete</Button>
            <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
