import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faHandHoldingDollar,
  faPlus,
  faSearch,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Subscription } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Subscriptions" });
  
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const subscriptionsData = await fetchApi<Subscription[]>({ table: "subscription" });
    setSubscriptions(subscriptionsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subscription.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalAmount = subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
  const activeCount = subscriptions.filter(
    (sub) => sub.statusId !== "2dee2fe0-e126-4ac4-b451-8e75c3316c7b" // Not closed
  ).length;

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      case "weekly":
        return "Weekly";
      default:
        return interval;
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <Icon icon={faSync} className={styles.icon} />
            <h1>Subscriptions</h1>
          </div>
          <Button href={LINKS.subscription.create} variant="primary">
            <Icon icon={faPlus} /> Create Subscription
          </Button>
        </div>

        <div className={styles.searchBar}>
          <Icon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{subscriptions.length}</div>
            <div className={styles.statLabel}>Total Subscriptions</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{activeCount}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>€{totalAmount.toFixed(2)}</div>
            <div className={styles.statLabel}>Monthly Cost</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon={faSync} className={styles.emptyIcon} />
          <h3>No subscriptions found</h3>
          <p>
            {searchQuery
              ? "No subscriptions match your search criteria"
              : "Get started by tracking your first subscription"}
          </p>
          {!searchQuery && (
            <Button href={LINKS.subscription.create} variant="primary">
              <Icon icon={faPlus} /> Create Subscription
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSubscriptions.map((subscription) => (
            <div key={subscription.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{subscription.name}</h3>
                <div className={styles.price}>€{(subscription.price || 0).toFixed(2)}</div>
              </div>
              
              {subscription.description && (
                <p className={styles.cardDescription}>{subscription.description}</p>
              )}

              <div className={styles.cardMeta}>
                {subscription.interval && (
                  <span className={styles.badge}>
                    {getIntervalLabel(subscription.interval)}
                  </span>
                )}
                {subscription.startDate && (
                  <span className={styles.badge}>
                    Since {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className={styles.cardActions}>
                <Button href={`${LINKS.subscription.index}/${subscription.id}`} variant="secondary" size="small">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
