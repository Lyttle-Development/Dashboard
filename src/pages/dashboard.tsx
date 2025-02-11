import { useCallback, useEffect, useState } from "react";

// Mapping of tables with their labels and API endpoints.
const tableConfigs: {
  [key: string]: { label: string; endpoint: string };
} = {
  customers: { label: "Customers", endpoint: "/api/customers" },
  addresses: { label: "Addresses", endpoint: "/api/addresses" },
  orders: { label: "Orders", endpoint: "/api/orders" },
  "order-items": { label: "Order Items", endpoint: "/api/order-items" },
  products: { label: "Products", endpoint: "/api/products" },
  categories: { label: "Categories", endpoint: "/api/categories" },
  invoices: { label: "Invoices", endpoint: "/api/invoices" },
  "print-jobs": { label: "Print Jobs", endpoint: "/api/print-jobs" },
  "print-materials": {
    label: "Print Materials",
    endpoint: "/api/print-materials",
  },
  projects: { label: "Projects", endpoint: "/api/projects" },
  "time-logs": { label: "Time Logs", endpoint: "/api/time-logs" },
  "service-prices": {
    label: "Service Prices",
    endpoint: "/api/service-prices",
  },
};

// Fallback keys for each table when no data exists.
const fallbackKeys: Record<string, string[]> = {
  customers: ["name", "email", "phone"],
  addresses: ["street", "city", "state", "country", "zipCode", "customerId"],
  orders: ["total", "status", "customerId"],
  "order-items": ["quantity", "price", "productId", "orderId"],
  products: ["name", "price", "description", "categoryId"],
  categories: ["name"],
  invoices: ["amount", "status", "customerId"],
  "print-jobs": [
    "scheduledDate",
    "quantity",
    "product",
    "printType",
    "materialId",
    "color",
    "printTime",
    "weight",
    "totalPrice",
    "suggestedPrice",
  ],
  "print-materials": ["type", "subType", "stock", "color", "unitPrice"],
  projects: ["name", "client"],
  "time-logs": [
    "projectId",
    "startTime",
    "endTime",
    "serviceType",
    "category",
    "hourlyRate",
    "totalPrice",
  ],
  "service-prices": [
    "category",
    "service",
    "estimatedMin",
    "estimatedMax",
    "standardMin",
    "standardMax",
    "friendsMin",
    "friendsMax",
  ],
};

/**
 * Returns an appropriate input type based on the field name and/or its current value.
 */
const getInputType = (key: string, value?: any): string => {
  const lower = key.toLowerCase();
  if (typeof value === "boolean") return "checkbox";
  if (lower.includes("date") || lower.includes("time")) return "datetime-local";
  if (lower.includes("email")) return "email";
  if (
    lower.includes("price") ||
    lower.includes("total") ||
    lower.includes("stock") ||
    lower.includes("quantity") ||
    lower.includes("weight") ||
    lower.includes("rate")
  ) {
    return "number";
  }
  return "text";
};

/**
 * Formats a date value to the "YYYY-MM-DDThh:mm" format required for datetime-local inputs.
 */
const formatDateTimeLocal = (val: any): string => {
  if (!val) return "";
  const date = new Date(val);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function Dashboard() {
  // Currently selected table.
  const [selectedTable, setSelectedTable] =
    useState<keyof typeof tableConfigs>("customers");
  // Data for the selected table.
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State for creating a new record.
  const [newRecord, setNewRecord] = useState<Record<string, any>>({});
  // State for inline editing an existing record.
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [editRecordData, setEditRecordData] = useState<Record<string, any>>({});

  // State for displaying a copy popup message.
  const [copyMessage, setCopyMessage] = useState<string>("");

  const config = tableConfigs[selectedTable];

  // Wrap fetchData in useCallback to avoid dependency warnings.
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(config.endpoint);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json || []);
    } catch (err) {
      console.error("Error fetching data", err);
      setData([]);
    }
    setLoading(false);
  }, [config.endpoint]);

  // Whenever the table selection changes, restore newRecord from localStorage and fetch data.
  useEffect(() => {
    const savedNewRecord = localStorage.getItem(`newRecord_${selectedTable}`);
    if (savedNewRecord) {
      try {
        setNewRecord(JSON.parse(savedNewRecord));
      } catch (err) {
        console.error("Error parsing saved newRecord", err);
      }
    } else {
      setNewRecord({});
    }
    fetchData();
  }, [selectedTable, fetchData]);

  // Persist newRecord changes to localStorage.
  useEffect(() => {
    localStorage.setItem(
      `newRecord_${selectedTable}`,
      JSON.stringify(newRecord),
    );
  }, [newRecord, selectedTable]);

  // Determine keys for the create form.
  // If data exists, use keys from the first row (excluding "id" and "createdAt").
  // Otherwise, use fallbackKeys.
  const createKeys = fallbackKeys[selectedTable] || [];

  // Copy cell value to clipboard and show a popup message.
  const handleCopy = (value: any) => {
    const text =
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage(`Copied: ${text}`);
        setTimeout(() => setCopyMessage(""), 2000);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  // Create a new record using the "newRecord" state.
  const handleCreate = async () => {
    try {
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        // Do not clear newRecord so that state persists if you want to create multiple records.
        fetchData();
      } else {
        alert("Error creating record");
      }
    } catch (error) {
      alert("Error creating record");
      console.error(error);
    }
  };

  // Delete a record by its ID.
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`${config.endpoint}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Error deleting record");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting record");
    }
  };

  // Begin editing a record.
  const handleEdit = (record: Record<string, any>) => {
    setEditRecordId(record.id);
    setEditRecordData(record);
  };

  // Save the edited record.
  const handleSaveEdit = async () => {
    if (!editRecordId) return;
    try {
      const res = await fetch(`${config.endpoint}/${editRecordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRecordData),
      });
      if (res.ok) {
        setEditRecordId(null);
        setEditRecordData({});
        fetchData();
      } else {
        alert("Error updating record");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating record");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Optional: Copy Popup */}
      {copyMessage && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            background: "green",
            color: "white",
            padding: "0.5rem",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          {copyMessage}
        </div>
      )}

      {/* Sidebar for selecting table */}
      <aside
        style={{
          width: "220px",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          background: "#f7f7f7",
          overflowY: "auto",
        }}
      >
        <h2>Tables</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(tableConfigs).map(([key, conf]) => (
            <li
              key={key}
              onClick={() => setSelectedTable(key as keyof typeof tableConfigs)}
              style={{
                marginBottom: "0.5rem",
                padding: "0.5rem",
                cursor: "pointer",
                background: selectedTable === key ? "#ddd" : "transparent",
                borderRadius: "4px",
              }}
            >
              {conf.label}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        <h1>{config.label} Dashboard</h1>

        {/* Create New Record Section */}
        <section style={{ marginBottom: "1rem" }}>
          <h2>Create New Record</h2>
          {createKeys.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "flex-end",
              }}
            >
              {createKeys.map((key) => {
                const inputType = getInputType(key, newRecord[key]);
                return (
                  <div key={key} style={{ flex: "1 1 150px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                      }}
                    >
                      {key}
                    </label>
                    {inputType === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={!!newRecord[key]}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            [key]: e.target.checked,
                          })
                        }
                      />
                    ) : inputType === "datetime-local" ? (
                      <input
                        type="datetime-local"
                        value={
                          newRecord[key]
                            ? formatDateTimeLocal(newRecord[key])
                            : ""
                        }
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            [key]: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "0.25rem",
                        }}
                      />
                    ) : (
                      <input
                        type={inputType}
                        value={newRecord[key] || ""}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            [key]:
                              inputType === "number"
                                ? parseFloat(e.target.value)
                                : e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "0.25rem",
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <div>
                <button onClick={handleCreate}>Create</button>
              </div>
            </div>
          ) : (
            <p>
              No fields available for creation. Please add data in another table
              first or configure fallback fields.
            </p>
          )}
        </section>

        {/* Data Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              marginBottom: "2rem",
            }}
          >
            <thead>
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        background: "#eee",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {key}
                    </th>
                  ))}
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "0.5rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={record.id || index}>
                  {Object.keys(record).map((key) => {
                    const inputType = getInputType(key, editRecordData[key]);
                    return (
                      <td
                        key={key}
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: editRecordId ? "default" : "pointer",
                        }}
                        onClick={() => {
                          if (!editRecordId) {
                            handleCopy(record[key]);
                          }
                        }}
                      >
                        {editRecordId === record.id ? (
                          inputType === "checkbox" ? (
                            <input
                              type="checkbox"
                              checked={!!editRecordData[key]}
                              onChange={(e) =>
                                setEditRecordData({
                                  ...editRecordData,
                                  [key]: e.target.checked,
                                })
                              }
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "0.25rem",
                              }}
                            />
                          ) : inputType === "datetime-local" ? (
                            <input
                              type="datetime-local"
                              value={
                                editRecordData[key]
                                  ? formatDateTimeLocal(editRecordData[key])
                                  : ""
                              }
                              onChange={(e) =>
                                setEditRecordData({
                                  ...editRecordData,
                                  [key]: e.target.value,
                                })
                              }
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "0.25rem",
                              }}
                            />
                          ) : (
                            <input
                              type={inputType}
                              value={editRecordData[key] || ""}
                              onChange={(e) =>
                                setEditRecordData({
                                  ...editRecordData,
                                  [key]:
                                    inputType === "number"
                                      ? parseFloat(e.target.value)
                                      : e.target.value,
                                })
                              }
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "0.25rem",
                              }}
                            />
                          )
                        ) : typeof record[key] === "object" &&
                          record[key] !== null ? (
                          JSON.stringify(record[key])
                        ) : (
                          record[key]
                        )}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "0.5rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {editRecordId === record.id ? (
                      <>
                        <button onClick={handleSaveEdit}>Save</button>
                        <button
                          onClick={() => setEditRecordId(null)}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(record)}>Edit</button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
