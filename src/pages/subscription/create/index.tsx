import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import {
  Customer,
  IntervalEnum,
  Subscription,
  SubscriptionStatusEnum,
} from "@/lib/prisma";
import { Loader } from "@/components/Loader";
import { safeParseFloat, safeParseInt } from "@/lib/parse";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Select } from "@/components/Select";

// Optional keys of Subscription
interface OptionalSubscription {
  name?: string;
  link?: string;
  image?: string;
  unitPrice?: number;
  quantity?: number;
  interval?: IntervalEnum;
  customerId?: string;
  statusId: string;
}

const emptySubscription: OptionalSubscription = {
  name: "",
  link: "",
  image: "",
  unitPrice: 0,
  quantity: 0,
  interval: IntervalEnum.MONTH,
  customerId: "",
  statusId: SubscriptionStatusEnum.CREATED,
};

function Page() {
  usePageTitle({ title: "Create Subscription" });
  const router = useRouter();

  const [loadings, setLoading] = useState({
    customer: true,
    global: false,
  });
  const updateLoading = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));
  const loading = Object.values(loadings).some((v) => v);
  const [subscription, setSubscription] =
    useState<OptionalSubscription>(emptySubscription);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    updateLoading("customer", true);
    const customersData = await fetchApi<Customer[]>({
      table: "customer",
    });
    setCustomers(customersData);
    updateLoading("customer", false);
  };

  useEffect(() => {
    void fetchCustomers();
  }, []);

  const restart = () => {
    setSubscription(emptySubscription);
  };

  const handleChange = (field: string, value: boolean | string | number) => {
    setSubscription((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createPrintJob = async () => {
    updateLoading("global", true);
    const data = await fetchApi<Subscription>({
      table: "subscription",
      method: "POST",
      body: {
        ...subscription,
      },
    });
    restart();
    updateLoading("global", false);
    void router.push(LINKS.subscription.detail(data.id));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Container>
      <h1 className={styles.title}>
        <span>Create Subscription</span>
        <Button onClick={restart}>Restart</Button>
      </h1>
      <Field
        label="Name"
        type={FormOptionType.TEXT}
        required
        onChange={(value) =>
          handleChange("name", typeof value === "string" ? value : "")
        }
        value={subscription.name}
      />
      <Select
        label="Select Customer"
        options={customers.map((customer) => ({
          label: customer.firstname + " " + customer.lastname,
          value: customer.id,
        }))}
        onValueChange={(value) =>
          handleChange("customerId", typeof value === "string" ? value : "")
        }
        value={subscription.customerId}
        searchable
      />
      <Field
        label="Link"
        type={FormOptionType.TEXT}
        onChange={(value) =>
          handleChange("link", typeof value === "string" ? value : "")
        }
        value={subscription.link}
      />
      <Field
        label="Unit Price"
        type={FormOptionType.NUMBER}
        onChange={(value) => handleChange("unitPrice", safeParseFloat(value))}
        value={subscription.unitPrice.toString()}
      />
      <Field
        label="Quantity"
        type={FormOptionType.NUMBER}
        onChange={(value) => handleChange("quantity", safeParseInt(value))}
        value={subscription.quantity.toString()}
      />
      <Select
        label="Select Interval"
        options={(Object.values(IntervalEnum) as string[]).map((interval) => ({
          label: interval,
          value: interval,
        }))}
        onValueChange={(value) =>
          handleChange("interval", typeof value === "string" ? value : "")
        }
        value={subscription.interval.toString()}
        searchable
      />

      {subscription &&
        !!subscription.name &&
        !!subscription.customerId &&
        !!subscription.link &&
        !!subscription.unitPrice &&
        !!subscription.quantity && (
          <Button onClick={createPrintJob}>Create Subscription</Button>
        )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
