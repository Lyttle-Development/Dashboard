import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import {
  Customer,
  IntervalEnum,
  Subscription,
  SubscriptionStatusEnum,
} from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Field } from "@/components/Field";
import { FormOptionType, FormValueTypes } from "@/components/Form";
import { Button, ButtonStyle } from "@/components/Button";
import { safeParseFloat, safeParseInt } from "@/lib/parse";
import { SideToSide } from "@/components/SideToSide";
import { Icon } from "@/components/Icon";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Link, LinkTarget } from "@/components/Link";
import { useApp } from "@/contexts/App.context";
import { KeyValue } from "@/components/KeyValue";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Select } from "@/components/Select";

export function Page() {
  usePageTitle({ title: "Subscription Details" });
  const router = useRouter();
  const { id: subscriptionId } = router.query;
  const app = useApp();

  const [subscription, setSubscription] = useState<Subscription>(null);
  const [originalSubscription, setOriginalSubscription] =
    useState<Subscription>(null);

  const [loadings, setLoading] = useState({
    customer: true,
    global: false,
  });
  const updateLoading = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));
  const loading = Object.values(loadings).some((v) => v);
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

  // Fetch the subscription details by id.
  const fetchSubscription = useCallback(async (id: string) => {
    updateLoading("global", true);
    const subscriptionData = await fetchApi<Subscription>({
      table: "subscription",
      id,
      relations: {
        status: true,
      },
    });

    setSubscription(subscriptionData);
    setOriginalSubscription(subscriptionData);
    updateLoading("global", false);
  }, []);

  useEffect(() => {
    if (subscriptionId) {
      void fetchSubscription(subscriptionId as string);
    }
  }, []);

  useEffect(() => {
    if (!subscription) return;
    void updateSubscription();
  }, [subscription?.image]);

  const handleChange = (field: string, value: FormValueTypes) => {
    setSubscription((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSubscription = async () => {
    await fetchApi<Subscription>({
      table: "subscription",
      id: subscription.id,
      method: "PUT",
      body: {
        name: subscription.name,
        link: subscription.link,
        image: subscription.image,
        unitPrice: subscription.unitPrice,
        quantity: subscription.quantity,
        interval: subscription.interval,
        customerId: subscription.customerId,
      },
    });
    setSubscription(subscription);
    setOriginalSubscription(subscription);
  };

  const deleteSubscription = async () => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      await fetchApi<Subscription>({
        table: "subscription",
        id: subscription.id,
        method: "DELETE",
      });
      void router.push(LINKS.subscription.root);
    }
  };

  const changes = Object.keys(subscription ?? {}).reduce((acc, key) => {
    if (subscription[key] !== originalSubscription[key]) {
      acc[key] = subscription[key];
    }
    return acc;
  }, {});
  const hasChanges = Object.keys(changes).length > 0;

  if (loading) return <Loader />;
  if (!subscription) return <div>Subscription not found</div>;
  const canAction = app.isOperationsManager || app.isManager;

  const setSubscriptionClosed = async (closed: boolean) => {
    await fetchApi<Subscription>({
      table: "subscription",
      id: subscription.id,
      method: "PUT",
      body: {
        statusId: closed
          ? SubscriptionStatusEnum.CLOSED
          : SubscriptionStatusEnum.REOPENED,
      },
    });
    await fetchSubscription(subscriptionId as string);
    if (closed) void router.push(LINKS.homepage);
  };

  return (
    <Container>
      <h2 className={styles.title}>
        <span>Subscription: {subscription.name}</span>
        <article className={styles.actions}>
          <Button
            onClick={() => router.push(LINKS.homepage)}
            style={ButtonStyle.Primary}
          >
            Go Back
          </Button>
          <Button onClick={deleteSubscription} style={ButtonStyle.Danger}>
            Delete Subscription
          </Button>
        </article>
      </h2>
      <article className={styles.information}>
        <KeyValue label="Status" value={subscription.status.status} />
        <Field
          label="Name"
          type={FormOptionType.TEXT}
          required
          onChange={(value) => handleChange("name", value)}
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
        <SideToSide className={styles.side_to_side}>
          <Field
            label="Link"
            type={FormOptionType.TEXT}
            onChange={(value) => handleChange("link", value)}
            value={subscription.link}
            className={styles.link}
          />
          <Link
            href={subscription.link}
            target={LinkTarget.BLANK}
            className={styles.linkButton}
          >
            <Icon icon={faLink} className={styles.icon} />
            <span>Open Link</span>
          </Link>
        </SideToSide>
        <Field
          label="Unit Price"
          type={FormOptionType.NUMBER}
          onChange={(value) => handleChange("unitPrice", safeParseFloat(value))}
          value={subscription.unitPrice}
        />
        <Field
          label="Quantity"
          type={FormOptionType.NUMBER}
          onChange={(value) => handleChange("quantity", safeParseInt(value))}
          value={subscription.quantity}
        />

        <Select
          label="Select Interval"
          options={(Object.values(IntervalEnum) as string[]).map(
            (interval) => ({
              label: interval,
              value: interval,
            }),
          )}
          onValueChange={(value) =>
            handleChange("interval", typeof value === "string" ? value : "")
          }
          value={subscription.interval.toString()}
          searchable
        />
      </article>
      {hasChanges && (
        <Button onClick={updateSubscription}>Update Subscription</Button>
      )}
      {canAction && (
        <SideToSide>
          {subscription.statusId !== SubscriptionStatusEnum.CLOSED ? (
            <Button
              onClick={() => setSubscriptionClosed(true)}
              style={ButtonStyle.Danger}
            >
              Close Subscription
            </Button>
          ) : (
            <Button
              onClick={() => setSubscriptionClosed(false)}
              style={ButtonStyle.Danger}
            >
              Reopen Subscription
            </Button>
          )}
        </SideToSide>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
