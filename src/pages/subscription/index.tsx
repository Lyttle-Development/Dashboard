import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faHandHoldingDollar,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Subscription } from "@/lib/prisma";
import { SideToSide } from "@/components/SideToSide";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Subscriptions" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const subscriptionsData = await fetchApi<Subscription[]>({
      table: "subscription",
      where: {
        statusId: {
          not: "2dee2fe0-e126-4ac4-b451-8e75c3316c7b", // Closed
        },
      },
    });
    setSubscriptions(subscriptionsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  if (loading) return <Loader />;

  return (
    <Container>
      <h1>Subscriptions</h1>

      <SideToSide>
        <Select
          label="Select Subscription"
          icon={faMagnifyingGlass}
          options={
            subscriptions && subscriptions.length
              ? subscriptions.map((subscription) => ({
                  label: subscription.name,
                  value: subscription.id,
                }))
              : []
          }
          onValueChange={(subscriptionId) =>
            router.push(LINKS.subscription.detail(subscriptionId))
          }
          disabled={!(subscriptions && subscriptions.length)}
        />
        <Button href={LINKS.subscription.create}>
          <Icon icon={faHandHoldingDollar}>Create Subscription</Icon>
        </Button>
      </SideToSide>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
