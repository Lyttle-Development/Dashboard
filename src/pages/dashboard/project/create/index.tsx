import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";
import { Category, Customer, Project, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { KeyValue } from "@/components/KeyValue";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { mapProjectsToOptions } from "@/pages/dashboard/project";

function Page() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customer, setCustomer] = useState<Customer>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [category, setCategory] = useState<Category>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState<ServicePrice>(null);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectParent, setProjectParent] = useState<Project>(null);

  const fetchCustomers = async () => {
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
  };

  const fetchCategories = async () => {
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData);
  };

  const fetchPrices = async () => {
    const pricesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      where: {
        categoryId: category.id,
      },
    });
    setPrices(pricesData);
  };

  const fetchProjects = async () => {
    const projectsData = await fetchApi<Project[]>({
      table: "project",
      where: { invoiceId: null },
      orderBy: { updatedAt: "desc" },
    });
    setProjects(projectsData ?? []);
  };

  useEffect(() => {
    if (!category) return;
    void fetchPrices();
  }, [category]);

  useEffect(() => {
    void fetchCategories();
    void fetchProjects();
  }, []);

  const restart = () => {
    setCustomerSearch("");
    setCustomer(null);
    setCustomers([]);

    setCategory(null);

    setPrices([]);
    setPrice(null);
  };

  const createProject = async () => {
    const data = await fetchApi<Project>({
      table: "project",
      method: "POST",
      body: {
        name,
        customerId: projectParent ? projectParent.customerId : customer.id,
        priceId: price.id,
        parentProjectId: projectParent?.id ?? null,
      },
    });
    restart();
    void router.push(`/dashboard/project/${data.id}`);
  };

  return (
    <Container>
      <h1 className={styles.title}>
        <span>Create Project</span>
        <Button onClick={restart}>Restart</Button>
      </h1>
      <Field
        label="Project Name"
        type={FormOptionType.TEXT}
        required
        onChange={setName}
      />
      {customer && !projectParent && (
        <KeyValue
          label="Customer"
          value={customer.firstname + " " + customer.lastname}
        />
      )}
      {!customer &&
        customers &&
        !projectParent &&
        (customers.length > 0 ? (
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
        ) : (
          <article className={styles.side_to_side}>
            <Field
              label="Search Customer"
              type={FormOptionType.TEXT}
              required
              onChange={setCustomerSearch}
              onSubmit={fetchCustomers}
            />
          </article>
        ))}

      {projects && projects.length > 0 && (
        <Select
          label="Select Parent Project"
          options={[
            {
              label: "None",
              value: null,
            },
            ...mapProjectsToOptions(projects),
          ]}
          onValueChange={(value) =>
            setProjectParent(projects.find((p) => p.id === value))
          }
          value={projectParent?.id ?? null}
        />
      )}
      {categories &&
        (category ? (
          <KeyValue label="Category" value={category.name} />
        ) : (
          <Select
            label="Select Category"
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            onValueChange={(value) =>
              setCategory(categories.find((c) => c.id === value))
            }
          />
        ))}
      {prices.length > 0 &&
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
      {price && category && (customer || projectParent) && name && (
        <Button onClick={createProject}>Create Project</Button>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
