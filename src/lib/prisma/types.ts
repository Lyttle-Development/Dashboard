export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  invoices: Invoice[];
  projects: Project[];
  printJobs: PrintJob[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  customerId: string;
  customer: Customer;
  updatedAt: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  prices: ServicePrice[];
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

export interface PrintJob {
  id: string;
  name: string;
  scheduledDate?: Date;
  ordered?: boolean;
  completed?: boolean;
  quantity?: number;
  printTime?: number;
  weight?: number;
  materialId: string;
  material: PrintMaterial;
  invoiceId?: string;
  invoice?: Invoice;
  updatedAt: Date;
  createdAt: Date;
  customerId?: string;
  customer?: Customer;
  timeLogs: TimeLog[];
  servicePriceId?: string;
  servicePrice?: ServicePrice;
}

export interface PrintMaterial {
  id: string;
  type: string;
  subType: string;
  stock: number;
  color: string;
  unitPrice: number;
  printJobs: PrintJob[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  client?: Customer;
  priceId?: string;
  price?: ServicePrice;
  invoiceId?: string;
  invoice?: Invoice;
  timeLogs: TimeLog[];
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

export interface ServicePrice {
  id: string;
  service?: string;
  standard?: number;
  standardMin?: number;
  standardMax?: number;
  friends?: number;
  friendsMin?: number;
  friendsMax?: number;
  categoryId?: string;
  category?: Category;
  projects: Project[];
  printJobs: PrintJob[];
  updatedAt: Date;
  createdAt: Date;
}
