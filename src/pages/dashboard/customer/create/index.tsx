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

function Page() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const restart = () => {
    setName("");
    setEmail("");
    setPhone("");
  };

  const createPrintJob = async () => {
    const data = await fetchApi<Customer>({
      table: "customer",
      method: "POST",
      body: {
        name,
        email,
        phone,
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
        label="Name"
        type={FormOptionType.TEXT}
        required
        onChange={setName}
      />
      <Field
        label="Email"
        type={FormOptionType.EMAIL}
        required
        onChange={setEmail}
      />
      <Field
        label="Phone"
        type={FormOptionType.TEXT}
        required
        onChange={setPhone}
      />
      {name && email && phone && (
        <Button onClick={createPrintJob}>Create Customer</Button>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
