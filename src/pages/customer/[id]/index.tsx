import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Customer, Project } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { Button, ButtonStyle } from "@/components/Button";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Customer Details" });
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer>(null);
  const [originalCustomer, setOriginalCustomer] = useState<Customer>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchPrintJob = useCallback(async (customerId: string) => {
    setLoading(true);
    const customerData = await fetchApi<Customer>({
      table: "customer",
      id: customerId,
      relations: {
        addresses: true,
        projects: true,
        printJobs: true,
      },
    });

    setCustomer(customerData);
    setOriginalCustomer(customerData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const customerId = router.query.id as string;
    if (customerId) {
      void fetchPrintJob(customerId);
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateProject = async () => {
    await fetchApi<Customer>({
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
    setCustomer(customer);
    setOriginalCustomer(customer);
  };

  const deleteProject = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await fetchApi<Customer>({
        table: "customer",
        id: customer.id,
        method: "DELETE",
      });
      void router.push(LINKS.customer.root);
    }
  };

  const changes = Object.keys(customer ?? {}).reduce((acc, key) => {
    if (customer[key] !== originalCustomer[key]) {
      acc[key] = customer[key];
    }
    return acc;
  }, {});
  const hasChanges = Object.keys(changes).length > 0;

  if (loading) return <Loader />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <Container>
      <h2 className={styles.project_title}>
        <span>
          Customer: {customer.firstname} {customer.lastname}
        </span>
        <Button onClick={deleteProject} style={ButtonStyle.Danger}>
          Delete Customer
        </Button>
      </h2>
      <article className={styles.information}>
        <Field
          label="firstname"
          type={FormOptionType.TEXT}
          value={customer.firstname}
          onChange={(value) =>
            handleChange("firstname", typeof value === "string" ? value : "")
          }
        />
        <Field
          label="lastname"
          type={FormOptionType.TEXT}
          value={customer.lastname}
          onChange={(value) =>
            handleChange("lastname", typeof value === "string" ? value : "")
          }
        />
        <Field
          label="email"
          type={FormOptionType.EMAIL}
          value={customer.email}
          onChange={(value) =>
            handleChange("email", typeof value === "string" ? value : "")
          }
        />
        <Field
          label="phone"
          type={FormOptionType.TEXT}
          value={customer.phone}
          onChange={(value) =>
            handleChange("phone", typeof value === "string" ? value : "")
          }
        />
      </article>
      {hasChanges && <Button onClick={updateProject}>Update Customer</Button>}

      <h3>Addresses</h3>
      <ul className={styles.addresses}>
        {customer.addresses.map((address) => (
          <li key={address.id} className={styles.address}>
            <p>{address.street}</p>
            <p>{address.city}</p>
            <p>{address.state}</p>
            <p>{address.zipCode}</p>
          </li>
        ))}
        {customer.addresses.length === 0 && <p>No addresses found</p>}
      </ul>

      <h3>Projects</h3>
      <ul className={styles.projects}>
        {customer.projects
          .reverse() // Show the most recent projects first
          .filter((p) => !p.invoiceId) // Only show projects that are not invoiced
          .map((project: Project) => (
            <li key={project.id}>
              <a
                href={LINKS.project.detail(project.id)}
                className={styles.project}
              >
                {project.name}
              </a>
            </li>
          ))}
        {customer.projects.length === 0 && <p>No projects found</p>}
      </ul>

      <h3>Print Jobs</h3>
      <ul className={styles.printJobs}>
        {customer.printJobs
          .filter((p) => !p.invoiceId) // Only show print jobs that are not invoiced
          .map((printJob) => (
            <li key={printJob.id} className={styles.printJob}>
              <a href={LINKS.homepage}>{printJob.name}</a>
            </li>
          ))}
        {customer.printJobs.length === 0 && <p>No print jobs found</p>}
      </ul>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
