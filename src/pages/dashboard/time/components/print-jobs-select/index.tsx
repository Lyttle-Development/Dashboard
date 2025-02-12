import { Select, SelectItemProps } from "@/components/select";
import { useCallback, useEffect, useState } from "react";

export function PrintJobsSelect() {
  const [loading, setLoading] = useState(false);
  const [printJobs, setPrintJobs] = useState([]);

  const fetchPrintJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/print-job?where={"completed":false}');
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setPrintJobs(json || []);
    } catch (err) {
      console.log("Error fetching data", err);
      setPrintJobs([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrintJobs();
  }, [fetchPrintJobs]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Select
      label="Select Print Job"
      options={mapPrintJobToOptions(printJobs)}
    />
  );
}

const mapPrintJobToOptions = (printJobs: any[]) => {
  printJobs = printJobs.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return printJobs.map((printJob) => {
    const createDate = new Date(printJob.createdAt);
    const updateDate = new Date(printJob.updatedAt);

    // format like "2021-10-01"
    const formattedCreateDate = createDate.toISOString().split("T")[0];
    const formattedUpdateDate = updateDate.toISOString().split("T")[0];

    const formattedDate = `${formattedCreateDate}:${formattedUpdateDate}`;

    // formated number : "001" or "105"
    const formattedQuantity = printJob.quantity.toString().padStart(3, "0");

    return {
      value: printJob.id,
      children: `[${formattedDate}]: (${formattedQuantity}) ${printJob.name}`,
    } as SelectItemProps;
  });
};
