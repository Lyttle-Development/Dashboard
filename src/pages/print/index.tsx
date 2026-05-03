import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faPrint, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { PrintJob, Customer } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Print Jobs" });

  const [loading, setLoading] = useState(true);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [printJobsData, customersData] = await Promise.all([
      fetchApi<PrintJob[]>({ table: "print-job" }),
      fetchApi<Customer[]>({ table: "customer" }),
    ]);
    setPrintJobs(printJobsData ?? []);
    setCustomers(customersData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredPrintJobs = printJobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const invoicedCount = printJobs.filter((job) => job.invoiceId !== null).length;
  const totalJobs = printJobs.length;

  const getCustomerName = (customerId: string | undefined) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstname} ${customer.lastname}` : "Unknown Customer";
  };

  return (
    <Container>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <Icon icon={faPrint} className={styles.icon} />
            <h1>Print Jobs</h1>
          </div>
          <Button href={LINKS.print.create} variant="primary">
            <Icon icon={faPlus} /> Create Print Job
          </Button>
        </div>

        <div className={styles.searchBar}>
          <Icon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search print jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{totalJobs}</div>
            <div className={styles.statLabel}>Total Jobs</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{invoicedCount}</div>
            <div className={styles.statLabel}>Invoiced</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{totalJobs - invoicedCount}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : filteredPrintJobs.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon={faPrint} className={styles.emptyIcon} />
          <h3>No print jobs found</h3>
          <p>
            {searchQuery
              ? "No print jobs match your search criteria"
              : "Get started by creating your first print job"}
          </p>
          {!searchQuery && (
            <Button href={LINKS.print.create} variant="primary">
              <Icon icon={faPlus} /> Create Print Job
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPrintJobs.map((job) => (
            <div key={job.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{job.name}</h3>
                {job.invoiceId && (
                  <span className={styles.invoicedBadge}>Invoiced</span>
                )}
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.badge}>
                  {getCustomerName(job.customerId)}
                </span>
                {job.material && (
                  <span className={styles.badge}>{job.material.type} {job.material.subType}</span>
                )}
                {job.weight && (
                  <span className={styles.badge}>{job.weight}g</span>
                )}
              </div>

              <div className={styles.cardActions}>
                <Button href={LINKS.print.detail(job.id)} variant="secondary" size="small">
                  View Details
                </Button>
                {!job.invoiceId && (
                  <Button
                    href={`${LINKS.invoice.create.print}/${job.id}`}
                    variant="primary"
                    size="small"
                  >
                    Create Invoice
                  </Button>
                )}
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
