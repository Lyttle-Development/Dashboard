import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Customer, Project, Address, Subscription, Expense } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { Button, ButtonStyle } from "@/components/Button";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Icon } from "@/components/Icon";
import { faEdit, faTrash, faPlus, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "@/components/Modal";

export function Page() {
  usePageTitle({ title: "Customer Details" });
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer>(null);
  const [originalCustomer, setOriginalCustomer] = useState<Customer>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    street: "",
    number: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  // Fetch the customer details by id.
  const fetchCustomer = useCallback(async (customerId: string) => {
    setLoading(true);
    try {
      const customerData = await fetchApi<Customer>({
        table: "customer",
        id: customerId,
        relations: {
          addresses: true,
          projects: true,
          printJobs: true,
          subscriptions: true,
          expenses: true,
        },
      });

      setCustomer(customerData);
      setOriginalCustomer(customerData);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const customerId = router.query.id as string;
    if (customerId) {
      void fetchCustomer(customerId);
    }
  }, [fetchCustomer, router.query.id]);

  const handleChange = (field: string, value: string) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCustomer = async () => {
    setLoading(true);
    try {
      const result = await fetchApi<Customer>({
        table: "customer",
        id: customer.id,
        method: "PUT",
        body: {
          firstname: customer.firstname,
          lastname: customer.lastname,
          email: customer.email,
          phone: customer.phone,
        },
      });
      
      if (result) {
        setOriginalCustomer(customer);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async () => {
    if (confirm("Are you sure you want to delete this customer?")) {
      setLoading(true);
      try {
        await fetchApi<Customer>({
          table: "customer",
          id: customer.id,
          method: "DELETE",
        });
        void router.push(LINKS.customer.root);
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Error deleting customer");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      alert("Please fill in at least street and city");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchApi<Address>({
        table: "address",
        method: "POST",
        body: {
          ...newAddress,
          customerId: customer.id,
        },
      });

      if (result) {
        setNewAddress({
          street: "",
          number: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        });
        setIsAddressModalOpen(false);
        await fetchCustomer(customer.id);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Error adding address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setLoading(true);
    try {
      await fetchApi<Address>({
        table: "address",
        id: addressId,
        method: "DELETE",
      });
      await fetchCustomer(customer.id);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Error deleting address");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setCustomer(originalCustomer);
    setIsEditing(false);
  };

  const changes = Object.keys(customer ?? {}).reduce((acc, key) => {
    if (customer[key] !== originalCustomer[key]) {
      acc[key] = customer[key];
    }
    return acc;
  }, {});
  const hasChanges = Object.keys(changes).length > 0;

  if (loading && !customer) return <Loader />;
  if (!customer) return <div>Customer not found</div>;

  const hasChanges = Object.keys(customer ?? {}).some(
    (key) => customer[key] !== originalCustomer[key]
  );

  return (
    <Container>
      <div className={styles.header}>
        <h1>
          {customer.firstname} {customer.lastname}
        </h1>
        <div className={styles.actions}>
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} style={ButtonStyle.Primary}>
                <Icon icon={faEdit} />
                Edit Customer
              </Button>
              <Button onClick={deleteCustomer} style={ButtonStyle.Danger}>
                <Icon icon={faTrash} />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button onClick={updateCustomer} style={ButtonStyle.Primary} disabled={!hasChanges || loading}>
                <Icon icon={faSave} />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={cancelEdit} disabled={loading}>
                <Icon icon={faTimes} />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Contact Information</h2>
        {isEditing ? (
          <div className={styles.formGrid}>
            <Field
              label="First Name"
              type={FormOptionType.TEXT}
              value={customer.firstname}
              onChange={(value) =>
                handleChange("firstname", typeof value === "string" ? value : "")
              }
            />
            <Field
              label="Last Name"
              type={FormOptionType.TEXT}
              value={customer.lastname}
              onChange={(value) =>
                handleChange("lastname", typeof value === "string" ? value : "")
              }
            />
            <Field
              label="Email"
              type={FormOptionType.EMAIL}
              value={customer.email}
              onChange={(value) =>
                handleChange("email", typeof value === "string" ? value : "")
              }
            />
            <Field
              label="Phone"
              type={FormOptionType.TEXT}
              value={customer.phone}
              onChange={(value) =>
                handleChange("phone", typeof value === "string" ? value : "")
              }
            />
          </div>
        ) : (
          <div className={styles.infoDisplay}>
            <div className={styles.infoItem}>
              <label>First Name</label>
              <p>{customer.firstname || "-"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Last Name</label>
              <p>{customer.lastname || "-"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Email</label>
              <p>{customer.email || "-"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Phone</label>
              <p>{customer.phone || "-"}</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Addresses</h2>
          <Button onClick={() => setIsAddressModalOpen(true)} style={ButtonStyle.Primary}>
            <Icon icon={faPlus} />
            Add Address
          </Button>
        </div>
        <div className={styles.addressList}>
          {customer.addresses.map((address) => (
            <div key={address.id} className={styles.addressCard}>
              <div className={styles.addressContent}>
                <p className={styles.addressLine}>
                  {address.street} {address.number}
                </p>
                <p className={styles.addressLine}>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                {address.country && <p className={styles.addressLine}>{address.country}</p>}
              </div>
              <Button
                onClick={() => handleDeleteAddress(address.id)}
                style={ButtonStyle.Danger}
              >
                <Icon icon={faTrash} />
              </Button>
            </div>
          ))}
          {customer.addresses.length === 0 && (
            <p className={styles.emptyMessage}>No addresses found</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Projects</h2>
        <div className={styles.relationList}>
          {customer.projects
            .filter((p) => !p.invoiceId)
            .map((project: Project) => (
              <a
                key={project.id}
                href={LINKS.project.detail(project.id)}
                className={styles.relationItem}
              >
                {project.name}
              </a>
            ))}
          {customer.projects.filter((p) => !p.invoiceId).length === 0 && (
            <p className={styles.emptyMessage}>No active projects found</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Print Jobs</h2>
        <div className={styles.relationList}>
          {customer.printJobs
            .filter((p) => !p.invoiceId)
            .map((printJob) => (
              <div key={printJob.id} className={styles.relationItem}>
                {printJob.name}
              </div>
            ))}
          {customer.printJobs.filter((p) => !p.invoiceId).length === 0 && (
            <p className={styles.emptyMessage}>No active print jobs found</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Subscriptions</h2>
        <div className={styles.relationList}>
          {customer.subscriptions?.map((subscription: Subscription) => (
            <div key={subscription.id} className={styles.relationItem}>
              {subscription.name || "Unnamed subscription"}
            </div>
          ))}
          {(!customer.subscriptions || customer.subscriptions.length === 0) && (
            <p className={styles.emptyMessage}>No subscriptions found</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Expenses</h2>
        <div className={styles.relationList}>
          {customer.expenses?.map((expense: Expense) => (
            <div key={expense.id} className={styles.relationItem}>
              {expense.name || "Unnamed expense"}
            </div>
          ))}
          {(!customer.expenses || customer.expenses.length === 0) && (
            <p className={styles.emptyMessage}>No expenses found</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setNewAddress({
            street: "",
            number: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
          });
        }}
        title="Add New Address"
        size="medium"
      >
        <div className={styles.modalForm}>
          <div className={styles.formGrid}>
            <Field
              label="Street *"
              type={FormOptionType.TEXT}
              value={newAddress.street}
              onChange={(value) =>
                setNewAddress({ ...newAddress, street: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="Number"
              type={FormOptionType.TEXT}
              value={newAddress.number}
              onChange={(value) =>
                setNewAddress({ ...newAddress, number: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="City *"
              type={FormOptionType.TEXT}
              value={newAddress.city}
              onChange={(value) =>
                setNewAddress({ ...newAddress, city: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="State"
              type={FormOptionType.TEXT}
              value={newAddress.state}
              onChange={(value) =>
                setNewAddress({ ...newAddress, state: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="Zip Code"
              type={FormOptionType.TEXT}
              value={newAddress.zipCode}
              onChange={(value) =>
                setNewAddress({ ...newAddress, zipCode: typeof value === "string" ? value : "" })
              }
            />
            <Field
              label="Country"
              type={FormOptionType.TEXT}
              value={newAddress.country}
              onChange={(value) =>
                setNewAddress({ ...newAddress, country: typeof value === "string" ? value : "" })
              }
            />
          </div>
          <div className={styles.formActions}>
            <Button onClick={handleAddAddress} style={ButtonStyle.Primary} disabled={loading}>
              <Icon icon={faPlus} />
              {loading ? "Adding..." : "Add Address"}
            </Button>
            <Button
              onClick={() => {
                setIsAddressModalOpen(false);
                setNewAddress({
                  street: "",
                  number: "",
                  city: "",
                  state: "",
                  country: "",
                  zipCode: "",
                });
              }}
              disabled={loading}
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
