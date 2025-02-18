import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { Customer } from "@/lib/prisma";

// Optional keys of Customer
interface OptionalCustomer {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}

const emptyCustomer: OptionalCustomer = {
  firstname: null,
  lastname: null,
  email: null,
  phone: null,
};

function Page() {
  const router = useRouter();

  const [customer, setCustomer] = useState<OptionalCustomer>(emptyCustomer);

  const restart = () => {
    setCustomer(emptyCustomer);
  };

  const handleChange = (field: string, value: string) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createPrintJob = async () => {
    const data = await fetchApi<Customer>({
      table: "customer",
      method: "POST",
      body: {
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
      },
    });
    restart();
    void router.push(`/dashboard/customer/${data.id}`);
  };

  return (
    <Container>
      <h1 className={styles.title}>
        <span>Create Customer</span>
        <Button onClick={restart}>Restart</Button>
      </h1>
      <Field
        label="First Name"
        type={FormOptionType.TEXT}
        required
        onChange={(value) => handleChange("firstname", value)}
      />
      <Field
        label="First Name"
        type={FormOptionType.TEXT}
        required
        onChange={(value) => handleChange("lastname", value)}
      />
      <Field
        label="Email"
        type={FormOptionType.EMAIL}
        required
        onChange={(value) => handleChange("email", value)}
      />
      <Field
        label="Phone"
        type={FormOptionType.TEXT}
        required
        onChange={(value) => handleChange("phone", value)}
      />
      {customer &&
        customer.firstname &&
        customer.lastname &&
        customer.email &&
        customer.phone && (
          <Button onClick={createPrintJob}>Create Customer</Button>
        )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
