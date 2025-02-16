export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  table: string;
  id?: string;
  relations?: Record<string, boolean>;
  where?: Record<string, any>;
}

function buildUrl(table: string, id: string, query: URLSearchParams) {
  const idStr = id ? `/${id}` : "";
  const queryStr = query.toString();
  return `/api/${table}${idStr}?${queryStr}`;
}

export async function fetchApi<T>({
  method = "GET",
  body,
  table,
  id = "",
  relations,
  where,
}: FetchOptions): Promise<T> {
  try {
    // Create and set headers
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Create searchParams
    const query = new URLSearchParams();

    // Get method options
    switch (method) {
      case "GET":
        if (relations) {
          query.set("relations", JSON.stringify(relations));
        }
        break;
      case "POST":
      case "PUT":
      case "DELETE":
        break;
    }

    if (where) {
      query.set("where", JSON.stringify(where));
    }

    const url = buildUrl(table, id, query);

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.log("Error in the fetchApi function:", e);
  }
  return null;
}
