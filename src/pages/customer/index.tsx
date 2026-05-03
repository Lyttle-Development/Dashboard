import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
    faCircleUser,
    faPlus,
    faTrash,
    faSearch,
    faEye, faTimes, faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button, ButtonStyle } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Customer } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import Link from "next/link";
import { Modal } from "@/components/Modal";

import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Customers" });
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newData, setNewData] = useState<Partial<Customer>>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const customersData = await fetchApi<Customer[]>({
      table: "customer",
    });
    setCustomers(customersData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = async () => {
    if (!newData.firstname || !newData.lastname) {
      alert("Please fill in first and last name");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchApi<Customer>({
        table: "customer",
        method: "POST",
        body: newData,
      });

      if (result) {
        setNewData({ firstname: "", lastname: "", email: "", phone: "" });
        setIsCreateModalOpen(false);
        await fetchCustomers();
      } else {
        alert("Error creating customer");
      }
    } catch (error) {
      alert("Error creating customer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    setLoading(true);
    try {
      const result = await fetchApi<Customer>({
        table: "customer",
        id,
        method: "DELETE",
      });

      if (result) {
        await fetchCustomers();
      } else {
        alert("Error deleting customer");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting customer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.firstname} ${customer.lastname}`.toLowerCase();
    const email = customer.email?.toLowerCase() || "";

    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Customers</h1>
          <p className={styles.subtitle}>
            Manage customer information and contact details
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} style={ButtonStyle.Primary}>
          <Icon icon={faPlus} />
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <Icon icon={faSearch} />
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewData({ firstname: "", lastname: "", email: "", phone: "" });
        }}
        title="Create New Customer"
        size="medium"
      >
        <div className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>First Name *</label>
              <input
                type="text"
                value={newData.firstname || ""}
                onChange={(e) =>
                  setNewData({ ...newData, firstname: e.target.value })
                }
                placeholder="John"
              />
            </div>
            <div className={styles.formField}>
              <label>Last Name *</label>
              <input
                type="text"
                value={newData.lastname || ""}
                onChange={(e) =>
                  setNewData({ ...newData, lastname: e.target.value })
                }
                placeholder="Doe"
              />
            </div>
            <div className={styles.formField}>
              <label>Email</label>
              <input
                type="email"
                value={newData.email || ""}
                onChange={(e) =>
                  setNewData({ ...newData, email: e.target.value })
                }
                placeholder="john.doe@example.com"
              />
            </div>
            <div className={styles.formField}>
              <label>Phone</label>
              <input
                type="tel"
                value={newData.phone || ""}
                onChange={(e) =>
                  setNewData({ ...newData, phone: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button onClick={handleCreate} style={ButtonStyle.Primary} disabled={loading}>
              <Icon icon={faCheck} />
              {loading ? "Creating..." : "Create"}
            </Button>
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewData({ firstname: "", lastname: "", email: "", phone: "" });
              }}
              disabled={loading}
            >
              <Icon icon={faTimes} />
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Customers List */}
      <div className={styles.customersList}>
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className={styles.customerCard}>
            <div className={styles.cardIcon}>
              <Icon icon={faCircleUser} />
            </div>
            <div className={styles.cardContent}>
              <h3>
                {customer.firstname} {customer.lastname}
              </h3>
              <div className={styles.cardMeta}>
                {customer.email && (
                  <span className={styles.email}>{customer.email}</span>
                )}
                {customer.phone && (
                  <span className={styles.phone}>{customer.phone}</span>
                )}
              </div>
            </div>
            <div className={styles.cardActions}>
              <Link href={LINKS.customer.detail(customer.id)}>
                <Button>
                  <Icon icon={faEye} />
                </Button>
              </Link>
              <Button
                onClick={() => handleDelete(customer.id)}
                style={ButtonStyle.Danger}
              >
                <Icon icon={faTrash} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className={styles.emptyState}>
          <Icon icon={faCircleUser} />
          <h3>No customers found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first customer to get started"}
          </p>
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
