export interface Category {
  id: string;
  name: string;
  prices: ServicePrice[];
  tasks: Task[];
  updatedAt: Date;
  createdAt: Date;
}

export interface ExpenseStatus {
  id: string;
  status: string;
  expenses: Expense[];
  updatedAt: Date;
  createdAt: Date;
}

export interface SubscriptionStatus {
  id: string;
  status: string;
  subscriptions: Subscription[];
  updatedAt: Date;
  createdAt: Date;
}

export interface InvoiceStatus {
  id: string;
  status: string;
  invoices: Invoice[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Customer {
  id: string;
  lastname?: string;
  firstname?: string;
  email: string;
  phone?: string;
  addresses: Address[];
  invoices: Invoice[];
  projects: Project[];
  printJobs: PrintJob[];
  expenses: Expense[];
  subscriptions: Subscription[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Address {
  id: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  customerId: string;
  customer: Customer;
  updatedAt: Date;
  createdAt: Date;
}

export interface ServicePrice {
  id: string;
  service?: string;
  price?: number;
  description?: string;
  notes?: string;
  interval?: string;
  categoryId?: string;
  category?: Category;
  projects: Project[];
  printJobs: PrintJob[];
  Invoice: Invoice[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceDate: Date;
  amount: number;
  statusId: string;
  status: InvoiceStatus;
  customerId: string;
  customer: Customer;
  projects: Project[];
  printJobs: PrintJob[];
  priceId?: string;
  price?: ServicePrice;
  updatedAt: Date;
  createdAt: Date;
}

export enum SubscriptionStatusEnum {
  CREATED = "74af779f-7d33-406c-bd78-af37df162a4b",
  REQUESTED = "91487c6c-31b7-42b5-9ef7-e4ec53115d6c",
  CLOSED = "55dafc7c-57d5-47e1-ade0-5b58c5e96b55",
  REOPENED = "06ff9974-2207-4d65-b3cb-a2ee4b08f003",
}

export enum IntervalEnum {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export interface Subscription {
  id: string;
  name?: string;
  link?: string;
  image?: string;
  unitPrice?: number;
  quantity?: number;
  interval?: IntervalEnum;
  customerId?: string;
  customer?: Customer;
  statusId: string;
  status: SubscriptionStatus;
  updatedAt: Date;
  createdAt: Date;
}

export enum ExpenseStatusEnum {
  CREATED = "d4865b11-2734-4dcf-ab35-154ccd193725",
  REQUESTED = "a2f734b1-613b-4383-b742-a4d5067f0a0c",
  APPROVED = "986a0ba6-96ce-431b-a3b7-d8f028afb2dd",
  ORDERED = "9c3be7d7-b09c-4aec-a58a-8c8a52f800a1",
  CLOSED = "2dee2fe0-e126-4ac4-b451-8e75c3316c7b",
  REOPENED = "22a537e3-7588-4639-a774-d1762a2e1718",
}

export interface Expense {
  id: string;
  neededAt?: Date;
  name?: string;
  link?: string;
  image?: string;
  unitPrice?: number;
  quantity?: number;
  approved?: boolean;
  recurring?: boolean;
  recurringInterval?: IntervalEnum;
  approvedAt?: Date;
  orderedAt?: Date;
  statusId: ExpenseStatusEnum;
  status: ExpenseStatus;
  customerId?: string;
  customer?: Customer;
  updatedAt: Date;
  createdAt: Date;
}

export interface PrintMaterial {
  id: string;
  type: string;
  subType: string;
  stock: number;
  color: string;
  unitPrice: number;
  unitAmount?: number;
  printJobs: PrintJob[];
  updatedAt: Date;
  createdAt: Date;
}

export interface PrintJob {
  id: string;
  name: string;
  scheduledDate?: Date;
  ordered?: boolean;
  completed?: boolean;
  quantity?: number;
  printTime?: number;
  weight?: number;
  customerId?: string;
  customer?: Customer;
  priceId?: string;
  price?: ServicePrice;
  materialId: string;
  material: PrintMaterial;
  invoiceId?: string;
  invoice?: Invoice;
  timeLogs: TimeLog[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  parentProjectId?: string;
  parentProject?: Project;
  childProjects: Project[];
  customerId?: string;
  customer?: Customer;
  priceId?: string;
  price?: ServicePrice;
  invoiceId?: string;
  Invoice?: Invoice;
  timeLogs: TimeLog[];
  tasks: Task[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Task {
  id: string;
  title?: string;
  description?: string;
  userId?: string;
  done?: boolean;
  categoryId?: string;
  category?: Category;
  projectId?: string;
  project?: Project;
  updatedAt: Date;
  createdAt: Date;
}

export interface TimeLog {
  id: string;
  startTime?: Date;
  endTime?: Date;
  user?: string;
  projectId?: string;
  project?: Project;
  printJobId?: string;
  printJob?: PrintJob;
  updatedAt: Date;
  createdAt: Date;
}
