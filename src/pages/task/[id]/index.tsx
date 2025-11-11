import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Button, ButtonStyle } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Icon } from "@/components/Icon";
import { faArrowLeft, faEdit, faTrash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { LINKS } from "@/links";

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDone, setEditDone] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchCategories();
      fetchProjects();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/task/${id}`);
      const data = await response.json();
      setTask(data);
      setEditTitle(data.title || "");
      setEditDescription(data.description || "");
      setEditDone(data.done || false);
      setEditCategoryId(data.categoryId || "");
      setEditProjectId(data.projectId || "");
    } catch (error) {
      console.error("Error fetching task:", error);
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

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/project");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      alert("Title is required");
      return;
    }

    try {
      const response = await fetch(`/api/task/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          done: editDone,
          categoryId: editCategoryId || null,
          projectId: editProjectId || null,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchTask();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/task/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(LINKS.task.root);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleDone = async () => {
    try {
      const response = await fetch(`/api/task/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });

      if (response.ok) {
        fetchTask();
      }
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!task) {
    return <div className={styles.container}>Task not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={LINKS.task.root}>
          <Button style={ButtonStyle.Default}>
            <Icon icon={faArrowLeft} /> Back
          </Button>
        </Link>
        <h1>{task.title}</h1>
        <div className={styles.actions}>
          <Button onClick={toggleDone} variant={task.done ? "secondary" : "success"}>
            <Icon icon={task.done ? faTimes : faCheck} />
            {task.done ? "Mark Incomplete" : "Mark Complete"}
          </Button>
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
          <h2>Task Details</h2>
          <div className={styles.field}>
            <label>Title</label>
            <p>{task.title}</p>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <p>{task.description || "No description"}</p>
          </div>
          <div className={styles.field}>
            <label>Status</label>
            <p>
              <span className={task.done ? styles.badgeSuccess : styles.badgeWarning}>
                {task.done ? "Completed" : "Open"}
              </span>
            </p>
          </div>
          {task.category && (
            <div className={styles.field}>
              <label>Category</label>
              <p>{task.category.name}</p>
            </div>
          )}
          {task.project && (
            <div className={styles.field}>
              <label>Project</label>
              <p>
                <Link href={LINKS.project.detail(task.project.id)}>
                  {task.project.name}
                </Link>
              </p>
            </div>
          )}
          <div className={styles.field}>
            <label>Created</label>
            <p>{new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={styles.field}>
            <label>Updated</label>
            <p>{new Date(task.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Task">
        <div className={styles.modalForm}>
          <div className={styles.formField}>
            <label>Title *</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div className={styles.formField}>
            <label>Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task description"
              rows={4}
            />
          </div>
          <div className={styles.formField}>
            <label>
              <input
                type="checkbox"
                checked={editDone}
                onChange={(e) => setEditDone(e.target.checked)}
              />
              Completed
            </label>
          </div>
          <div className={styles.formField}>
            <label>Category</label>
            <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label>Project</label>
            <select value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)}>
              <option value="">No project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button onClick={handleEdit} style={ButtonStyle.Primary}>
              Save Changes
            </Button>
            <Button onClick={() => setShowEditModal(false)} style={ButtonStyle.Default}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Task" size="small">
        <div className={styles.modalForm}>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <Button onClick={handleDelete} style={ButtonStyle.Danger}>
              Delete
            </Button>
            <Button onClick={() => setShowDeleteConfirm(false)} style={ButtonStyle.Default}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
