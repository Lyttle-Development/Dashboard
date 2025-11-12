import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";
import { Customer, PrintJob, PrintMaterial, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { KeyValue } from "@/components/KeyValue";
import { Button, ButtonStyle } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { Loader } from "@/components/Loader";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Modal } from "@/components/Modal";
import { Icon } from "@/components/Icon";
import { faPlus, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

function Page() {
  usePageTitle({ title: "Create Print Job" });
  const router = useRouter();

  const [loadings, setLoading] = useState<{ [key: string]: boolean }>({
    customer: false,
    material: false,
    price: false,
    global: false,
  });
  const updateLoading = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));
  const loading = Object.values(loadings).some((v) => v);
  const [name, setName] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customer, setCustomer] = useState<Customer>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [material, setMaterial] = useState<PrintMaterial>(null);
  const [materials, setMaterials] = useState<PrintMaterial[]>([]);
  const [price, setPrice] = useState<ServicePrice>(null);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [newMaterial, setNewMaterial] = useState({
    type: "",
    subType: "",
    color: "",
    stock: 0,
    unitPrice: 0,
    unitAmount: 1000,
  });

  const fetchCustomers = async () => {
    updateLoading("customer", true);
    const customersData = await fetchApi<Customer[]>({
      table: "customer",
      where: {
        firstname: {
          contains: customerSearch,
          mode: "insensitive",
        },
      },
    });
    setCustomers(customersData);
    if (customersData?.length === 1) setCustomer(customersData[0]);
    updateLoading("customer", false);
  };

  const fetchMaterials = async () => {
    updateLoading("material", true);
    const materialsData = await fetchApi<PrintMaterial[]>({
      table: "printMaterial",
    });
    setMaterials(materialsData);
    updateLoading("material", false);
  };

  const fetchPrices = async () => {
    updateLoading("price", true);
    const pricesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      where: {
        categoryId: "71e25dc1-f273-4b1e-a91a-7758d0394d3f",
      },
    });
    setPrices(pricesData);
    updateLoading("price", false);
  };

  useEffect(() => {
    void fetchMaterials();
    void fetchPrices();
  }, []);

  const restart = () => {
    updateLoading("global", true);
    setCustomerSearch("");
    setCustomer(null);
    setCustomers([]);

    setPrice(null);
    updateLoading("global", false);
  };

  const createPrintJob = async () => {
    updateLoading("global", true);
    const data = await fetchApi<PrintJob>({
      table: "print-job",
      method: "POST",
      body: {
        name,
        customerId: customer.id,
        priceId: price.id,
        materialId: material.id,
      },
    });
    restart();
    updateLoading("global", false);
    void router.push(LINKS.print.detail(data.id));
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.firstname || !newCustomer.lastname || !newCustomer.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      if (res.ok) {
        const createdCustomer = await res.json();
        setCustomers([...customers, createdCustomer]);
        setCustomer(createdCustomer);
        setNewCustomer({ firstname: "", lastname: "", email: "", phone: "" });
        setShowCustomerModal(false);
      } else {
        alert("Error creating customer");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating customer");
    }
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.type || !newMaterial.color) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/printMaterial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMaterial),
      });

      if (res.ok) {
        const createdMaterial = await res.json();
        setMaterials([...materials, createdMaterial]);
        setMaterial(createdMaterial);
        setNewMaterial({
          type: "",
          subType: "",
          color: "",
          stock: 0,
          unitPrice: 0,
          unitAmount: 1000,
        });
        setShowMaterialModal(false);
      } else {
        alert("Error creating material");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating material");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <h1 className={styles.title}>
        <span>Create Print Job</span>
        <Button onClick={restart}>Restart</Button>
      </h1>
      <Field
        label="Print Job Name"
        type={FormOptionType.TEXT}
        required
        onChange={(value) => setName(typeof value === "string" ? value : "")}
        value={name}
      />
      {customer && (
        <KeyValue
          label="Customer"
          value={customer.firstname + " " + customer.lastname}
        />
      )}
      {!customer &&
        customers &&
        (customers.length > 0 ? (
          <div className={styles.selectWithAdd}>
            <Select
              label="Select Customer"
              options={customers.map((customer) => ({
                label: customer.firstname + " " + customer.lastname,
                value: customer.id,
              }))}
              onValueChange={(value) =>
                setCustomer(customers.find((c) => c.id === value))
              }
            />
            <Button
              onClick={() => setShowCustomerModal(true)}
              title="Create new customer"
              style={ButtonStyle.Primary}
            >
              <Icon icon={faPlus} />
            </Button>
          </div>
        ) : (
          <article className={styles.side_to_side}>
            <Field
              label="Search Customer"
              type={FormOptionType.TEXT}
              required
              onChange={(value) =>
                setCustomerSearch(typeof value === "string" ? value : "")
              }
              onSubmit={fetchCustomers}
              value={customerSearch}
            />
            <Button
              onClick={() => setShowCustomerModal(true)}
              style={ButtonStyle.Primary}
            >
              <Icon icon={faPlus} />
              New Customer
            </Button>
          </article>
        ))}
      {materials &&
        materials.length > 0 &&
        (material ? (
          <KeyValue label="Material" value={material.type} />
        ) : (
          <div className={styles.selectWithAdd}>
            <Select
              label="Select Material"
              options={materials.map((material) => ({
                label: `${material.type}: ${material.color}`,
                value: material.id,
              }))}
              onValueChange={(value) =>
                setMaterial(materials.find((m) => m.id === value))
              }
            />
            <Button
              onClick={() => setShowMaterialModal(true)}
              title="Create new material"
              style={ButtonStyle.Primary}
            >
              <Icon icon={faPlus} />
            </Button>
          </div>
        ))}
      {prices &&
        prices.length > 0 &&
        (price ? (
          <KeyValue label="Service" value={price.service} />
        ) : (
          <Select
            label="Select Price"
            options={prices.map((price) => ({
              label: price.service,
              value: price.id,
            }))}
            onValueChange={(value) =>
              setPrice(prices.find((p) => p.id === value))
            }
          />
        ))}
      {!!material && !!price && !!customer && !!name && (
        <Button onClick={createPrintJob}>Create Print Job</Button>
      )}

      {/* Customer Creation Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setNewCustomer({ firstname: "", lastname: "", email: "", phone: "" });
        }}
        title="Create New Customer"
        size="medium"
      >
        <div className={styles.modalContent}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>First Name *</label>
              <input
                type="text"
                value={newCustomer.firstname}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, firstname: e.target.value })
                }
                placeholder="John"
                autoFocus
              />
            </div>
            <div className={styles.formField}>
              <label>Last Name *</label>
              <input
                type="text"
                value={newCustomer.lastname}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, lastname: e.target.value })
                }
                placeholder="Doe"
              />
            </div>
            <div className={styles.formField}>
              <label>Email *</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                placeholder="john.doe@example.com"
              />
            </div>
            <div className={styles.formField}>
              <label>Phone</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              onClick={handleCreateCustomer}
              style={ButtonStyle.Primary}
            >
              <Icon icon={faCheck} />
              Create Customer
            </Button>
            <Button
              onClick={() => {
                setShowCustomerModal(false);
                setNewCustomer({ firstname: "", lastname: "", email: "", phone: "" });
              }}
            >
              <Icon icon={faTimes} />
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Material Creation Modal */}
      <Modal
        isOpen={showMaterialModal}
        onClose={() => {
          setShowMaterialModal(false);
          setNewMaterial({
            type: "",
            subType: "",
            color: "",
            stock: 0,
            unitPrice: 0,
            unitAmount: 1000,
          });
        }}
        title="Create New Print Material"
        size="medium"
      >
        <div className={styles.modalContent}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Material Type *</label>
              <input
                type="text"
                value={newMaterial.type}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, type: e.target.value })
                }
                placeholder="PLA, ABS, PETG"
                autoFocus
              />
            </div>
            <div className={styles.formField}>
              <label>Sub Type</label>
              <input
                type="text"
                value={newMaterial.subType}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, subType: e.target.value })
                }
                placeholder="Standard, Premium"
              />
            </div>
            <div className={styles.formField}>
              <label>Color *</label>
              <input
                type="text"
                value={newMaterial.color}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, color: e.target.value })
                }
                placeholder="Black, White, Red"
              />
            </div>
            <div className={styles.formField}>
              <label>Stock (g)</label>
              <input
                type="number"
                value={newMaterial.stock}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    stock: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className={styles.formField}>
              <label>Unit Price</label>
              <input
                type="number"
                step="0.01"
                value={newMaterial.unitPrice}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className={styles.formField}>
              <label>Unit Amount (g)</label>
              <input
                type="number"
                value={newMaterial.unitAmount}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    unitAmount: parseFloat(e.target.value) || 1000,
                  })
                }
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              onClick={handleCreateMaterial}
              style={ButtonStyle.Primary}
            >
              <Icon icon={faCheck} />
              Create Material
            </Button>
            <Button
              onClick={() => {
                setShowMaterialModal(false);
                setNewMaterial({
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
      </Modal>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
