import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";
import { Category, Customer, Project, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { Loader } from "@/components/Loader";
import { mapProjectsToOptions } from "@/lib/project";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

function Page() {
  usePageTitle({ title: "Create Project" });
  const router = useRouter();

  const [loadings, setLoading] = useState<{ [key: string]: boolean }>({
    customer: false,
    category: false,
    price: false,
    project: false,
    global: false,
  });
  const updateLoading = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));
  const loading = Object.values(loadings).some((l) => l);
  const [name, setName] = useState<string>("");
  const [customer, setCustomer] = useState<Customer>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [category, setCategory] = useState<Category>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState<ServicePrice>(null);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectParent, setProjectParent] = useState<Project>(null);

  const fetchCustomers = async () => {
    updateLoading("customer", true);
    const customersData = await fetchApi<Customer[]>({
      table: "customer",
    });
    setCustomers(customersData);
    updateLoading("customer", false);
  };

  const fetchCategories = async () => {
    updateLoading("category", true);
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData);
    updateLoading("category", false);
  };

  const fetchPrices = async () => {
    updateLoading("price", true);
    const pricesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      where: {
        categoryId: category.id,
      },
    });
    setPrices(pricesData);
    if (pricesData?.length === 1) setPrice(pricesData[0]);
    updateLoading("price", false);
  };

  const fetchProjects = async () => {
    updateLoading("project", true);
    const projectsData = await fetchApi<Project[]>({
      table: "project",
      where: { invoiceId: null },
      orderBy: { updatedAt: "desc" },
      relations: { timeLogs: true },
    });
    setProjects(projectsData ?? []);
    updateLoading("project", false);
  };

  useEffect(() => {
    if (!category) return;
    void fetchPrices();
  }, [category]);

  useEffect(() => {
    void fetchCategories();
    void fetchProjects();
    void fetchCustomers();
  }, []);

  const restart = () => {
    updateLoading("global", true);
    setCustomer(null);
    setCustomers([]);

    setCategory(null);

    setPrices([]);
    setPrice(null);
    updateLoading("global", false);
  };

  const createProject = async () => {
    updateLoading("global", true);
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
    updateLoading("global", false);
    void router.push(LINKS.project.detail(data.id));
  };

  if (loading) return <Loader />;

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
        onChange={(value) => setName(typeof value === "string" ? value : "")}
        value={name}
      />
      {customers && !projectParent && (
        <Select
          label="Select Customer"
          options={customers.map((customer) => ({
            label: customer.firstname + " " + customer.lastname,
            value: customer.id,
          }))}
          onValueChange={(value) =>
            setCustomer(customers.find((c) => c.id === value))
          }
          value={customer?.id ?? ""}
          searchable
        />
      )}

      {!customer && projects && projects.length > 0 && (
        <Select
          label="Select Parent Project"
          options={[
            {
              label: "None",
              value: null,
            },
            ...mapProjectsToOptions(projects, false),
          ]}
          onValueChange={(value) =>
            setProjectParent(projects.find((p) => p.id === value))
          }
          value={projectParent?.id ?? ""}
          searchable
        />
      )}
      {categories && (
        <Select
          label="Select Category"
          options={categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          onValueChange={(value) => {
            setCategory(categories.find((c) => c.id === value));
            setPrice(null);
          }}
          searchable
        />
      )}
      {prices.length > 0 && (
        <Select
          label="Select Price"
          options={prices.map((price) => ({
            label: price.service,
            value: price.id,
          }))}
          onValueChange={(value) =>
            setPrice(prices.find((p) => p.id === value))
          }
          value={price?.id ?? ""}
          searchable
        />
      )}
      {!!price && !!category && (!!customer || !!projectParent) && !!name && (
        <Button onClick={createProject}>Create Project</Button>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
