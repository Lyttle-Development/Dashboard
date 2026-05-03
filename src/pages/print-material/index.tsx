import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { PrintMaterial } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import {
  faCube,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonStyle } from "@/components/Button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatCurrency } from "@/lib/invoice";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Print Materials" });
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<PrintMaterial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PrintMaterial>>({});
  const [creating, setCreating] = useState(false);
  const [newData, setNewData] = useState<Partial<PrintMaterial>>({
    type: "",
    subType: "",
    color: "",
    stock: 0,
    unitPrice: 0,
    unitAmount: 1000, // Default to 1000g (1kg)
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const materialsData = await fetchApi<PrintMaterial[]>({
      table: "printMaterial",
    });
    setMaterials(materialsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!newData.type || !newData.color) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/printMaterial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (res.ok) {
        setNewData({
          type: "",
          subType: "",
          color: "",
          stock: 0,
          unitPrice: 0,
          unitAmount: 1000,
        });
        setCreating(false);
        await fetchData();
      } else {
        alert("Error creating print material");
      }
    } catch (error) {
      alert("Error creating print material");
      console.error(error);
    }
  };

  const handleEdit = (material: PrintMaterial) => {
    setEditingId(material.id);
    setEditData(material);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const res = await fetch(`/api/printMaterial/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setEditingId(null);
        setEditData({});
        await fetchData();
      } else {
        alert("Error updating print material");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating print material");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this print material?"))
      return;

    try {
      const res = await fetch(`/api/printMaterial/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert("Error deleting print material");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting print material");
    }
  };

  if (loading) return <Loader />;

  const pricePerGram = (material: PrintMaterial) =>
    material.unitAmount > 0
      ? material.unitPrice / material.unitAmount
      : 0;

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Print Materials</h1>
          <p className={styles.subtitle}>
            Manage 3D printing materials, stock levels, and pricing
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)} style={ButtonStyle.Primary}>
            <Icon icon={faPlus} />
            Add Material
          </Button>
        )}
      </div>

      {/* Create Form */}
      {creating && (
        <div className={styles.createForm}>
          <h2>Create New Print Material</h2>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Material Type *</label>
              <input
                type="text"
                value={newData.type || ""}
                onChange={(e) =>
                  setNewData({ ...newData, type: e.target.value })
                }
                placeholder="e.g., PLA, ABS, PETG"
              />
            </div>
            <div className={styles.formField}>
              <label>Sub Type</label>
              <input
                type="text"
                value={newData.subType || ""}
                onChange={(e) =>
                  setNewData({ ...newData, subType: e.target.value })
                }
                placeholder="e.g., Standard, Premium"
              />
            </div>
            <div className={styles.formField}>
              <label>Color *</label>
              <input
                type="text"
                value={newData.color || ""}
                onChange={(e) =>
                  setNewData({ ...newData, color: e.target.value })
                }
                placeholder="e.g., Black, White, Red"
              />
            </div>
            <div className={styles.formField}>
              <label>Stock (g)</label>
              <input
                type="number"
                value={newData.stock || 0}
                onChange={(e) =>
                  setNewData({ ...newData, stock: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className={styles.formField}>
              <label>Unit Price</label>
              <input
                type="number"
                step="0.01"
                value={newData.unitPrice || 0}
                onChange={(e) =>
                  setNewData({
                    ...newData,
                    unitPrice: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className={styles.formField}>
              <label>Unit Amount (g)</label>
              <input
                type="number"
                value={newData.unitAmount || 1000}
                onChange={(e) =>
                  setNewData({
                    ...newData,
                    unitAmount: parseFloat(e.target.value),
                  })
                }
                placeholder="e.g., 1000 for 1kg"
              />
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
                setNewData({
                  type: "",
                  subType: "",
                  color: "",
                  stock: 0,
                  unitPrice: 0,
                  unitAmount: 1000,
                });
              }}
            >
              <Icon icon={faTimes} />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className={styles.materialsList}>
        {materials.map((material) => (
          <div key={material.id} className={styles.materialCard}>
            {editingId === material.id ? (
              <>
                <div className={styles.editForm}>
                  <div className={styles.formField}>
                    <label>Type</label>
                    <input
                      type="text"
                      value={editData.type || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, type: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Sub Type</label>
                    <input
                      type="text"
                      value={editData.subType || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, subType: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Color</label>
                    <input
                      type="text"
                      value={editData.color || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, color: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Stock (g)</label>
                    <input
                      type="number"
                      value={editData.stock || 0}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          stock: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.unitPrice || 0}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          unitPrice: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Unit Amount (g)</label>
                    <input
                      type="number"
                      value={editData.unitAmount || 1000}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          unitAmount: parseFloat(e.target.value),
                        })
                      }
                    />
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
                  <Icon icon={faCube} />
                </div>
                <div className={styles.cardContent}>
                  <h3>
                    {material.type} {material.subType && `- ${material.subType}`}
                  </h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.color}>
                      <span
                        className={styles.colorDot}
                        style={{
                          backgroundColor: material.color.toLowerCase(),
                        }}
                      />
                      {material.color}
                    </span>
                    <span className={styles.stock}>
                      Stock: {material.stock}g
                    </span>
                    <span className={styles.price}>
                      {formatCurrency(pricePerGram(material))}/g
                    </span>
                    <span className={styles.unitPrice}>
                      {formatCurrency(material.unitPrice)}/{material.unitAmount}g
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button onClick={() => handleEdit(material)}>
                    <Icon icon={faEdit} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(material.id)}
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

      {materials.length === 0 && !creating && (
        <div className={styles.emptyState}>
          <Icon icon={faCube} />
          <h3>No print materials yet</h3>
          <p>Add your first print material to get started</p>
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
