import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Customer } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { Button } from "@/components/Button";

export function Page() {
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
      void router.push("/dashboard/customer");
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
        <Button onClick={deleteProject}>Delete Customer</Button>
      </h2>
      <article className={styles.information}>
        <Field
          label="firstname"
          type={FormOptionType.TEXT}
          value={customer.firstname}
          onChange={(value) => handleChange("firstname", value)}
        />
        <Field
          label="lastname"
          type={FormOptionType.TEXT}
          value={customer.lastname}
          onChange={(value) => handleChange("lastname", value)}
        />
        <Field
          label="email"
          type={FormOptionType.EMAIL}
          value={customer.email}
          onChange={(value) => handleChange("email", value)}
        />
        <Field
          label="phone"
          type={FormOptionType.TEXT}
          value={customer.phone}
          onChange={(value) => handleChange("phone", value)}
        />
      </article>
      {hasChanges && <Button onClick={updateProject}>Update Customer</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
