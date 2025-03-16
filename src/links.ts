// export type Link = string | ((...args: string[]) => string);
//
// export interface Links {
//   [key: string]: Link | Links;
// }

export const LINKS = {
  homepage: "/",
  project: {
    root: "/project",
    create: "/project/create",
    detail: (id: string) => `/project/${id}`,
  },
  print: {
    root: "/print",
    create: "/print/create",
    detail: (id: string) => `/print/${id}`,
  },
  task: {
    root: "/task",
    create: "/task/create",
    detail: (id: string) => `/task/${id}`,
  },
  customer: {
    root: "/customer",
    create: "/customer/create",
    detail: (id: string) => `/customer/${id}`,
  },
  price: {
    root: "/price",
    create: "/price/create",
    detail: (id: string) => `/price/${id}`,
  },
  invoice: {
    root: "/invoice",
    create: "/invoice/create",
    detail: (id: string) => `/invoice/${id}`,
  },
  expense: {
    root: "/expense",
    create: "/expense/create",
    detail: (id: string) => `/expense/${id}`,
  },
  fallback: "/fallback",
} as const;
