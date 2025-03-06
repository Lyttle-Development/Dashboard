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

export interface InvoiceStatus {
  id: string;
  status: string;
  invoices: Invoice[];
  Expense: Expense[];
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
  Expense: Expense[];
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

export interface Expense {
  id: string;
  neededAt?: Date;
  link?: string;
  unitPrice?: string;
  quantity?: number;
  approved?: boolean;
  approvedAt?: Date;
  orderedAt?: Date;
  statusId: string;
  status: InvoiceStatus;
  customerId?: string;
  customer?: Customer;
  expenseStatusId?: string;
  expenseStatus?: ExpenseStatus;
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
