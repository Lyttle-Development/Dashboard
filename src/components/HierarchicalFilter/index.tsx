import { useState, useEffect } from "react";
import { Customer, Project } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import styles from "./index.module.scss";
import { Icon } from "@/components/Icon";
import { faUser, faDiagramProject, faSearch } from "@fortawesome/free-solid-svg-icons";

interface HierarchicalFilterProps {
  onCustomerChange?: (customer: Customer | null) => void;
  onProjectChange?: (project: Project | null) => void;
  showProjectFilter?: boolean;
  selectedCustomerId?: string;
  selectedProjectId?: string;
  placeholder?: {
    customer?: string;
    project?: string;
  };
}

export function HierarchicalFilter({
  onCustomerChange,
  onProjectChange,
  showProjectFilter = false,
  selectedCustomerId,
  selectedProjectId,
  placeholder = {},
}: HierarchicalFilterProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await fetchApi<Customer[]>({
          table: "customer",
        });
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch projects when customer is selected
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedCustomer) {
        setProjects([]);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchApi<Project[]>({
          table: "project",
          where: {
            customerId: selectedCustomer.id,
          },
        });
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showProjectFilter) {
      fetchProjects();
    }
  }, [selectedCustomer, showProjectFilter]);

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId) || null;
    setSelectedCustomer(customer);
    setSelectedProject(null); // Reset project when customer changes
    onCustomerChange?.(customer);
    onProjectChange?.(null); // Clear project selection
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId) || null;
    setSelectedProject(project);
    onProjectChange?.(project);
  };

  // Filter customers by search
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = customerSearch.toLowerCase();
    const fullName = `${customer.firstname || ""} ${customer.lastname || ""}`.toLowerCase();
    const email = (customer.email || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Filter projects by search
  const filteredProjects = projects.filter((project) => {
    const searchLower = projectSearch.toLowerCase();
    return (project.name || "").toLowerCase().includes(searchLower);
  });

  return (
    <div className={styles.hierarchicalFilter}>
      {/* Customer Filter - Always shown first */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          <Icon icon={faUser} />
          <span>Select Customer First</span>
        </label>
        <div className={styles.filterInput}>
          <Icon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={selectedCustomer?.id || ""}
          onChange={(e) => handleCustomerSelect(e.target.value)}
          className={styles.select}
          disabled={loading}
        >
          <option value="">
            {placeholder.customer || "Choose a customer..."}
          </option>
          {filteredCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstname} {customer.lastname}
              {customer.email && ` (${customer.email})`}
            </option>
          ))}
        </select>
      </div>

      {/* Project Filter - Only shown when enabled and customer selected */}
      {showProjectFilter && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Icon icon={faDiagramProject} />
            <span>Then Select Project</span>
          </label>
          {!selectedCustomer ? (
            <div className={styles.disabledMessage}>
              Please select a customer first
            </div>
          ) : (
            <>
              <div className={styles.filterInput}>
                <Icon icon={faSearch} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className={styles.searchInput}
                  disabled={!selectedCustomer}
                />
              </div>
              <select
                value={selectedProject?.id || ""}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className={styles.select}
                disabled={loading || !selectedCustomer}
              >
                <option value="">
                  {placeholder.project || "Choose a project..."}
                </option>
                {filteredProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
    </div>
  );
}
