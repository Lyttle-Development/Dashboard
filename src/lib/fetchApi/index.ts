export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  table: string;
  id?: string;
  relations?: Record<string, boolean>;
  where?: Record<string, any>;
  orderBy?: Record<string, string>;
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
  orderBy,
}: FetchOptions): Promise<T | null> {
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

    if (orderBy) {
      query.set("orderBy", JSON.stringify(orderBy));
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

export async function fetchPreview(url: string) {
  try {
    // Create and set headers
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Create searchParams
    const encodedUrl = encodeURIComponent(url);
    const res = await fetch("/api/preview/?url=" + encodedUrl, { headers });

    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.log("Error in the fetchApi function:", e);
  }
  return null;
}
