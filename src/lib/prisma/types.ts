export enum PrintType {
  FDM = "FDM",
  SLA = "SLA",
  Resin = "Resin",
}

export enum ServiceCategory {
  PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",
  DESIGN = "DESIGN",
  DEVELOPMENT = "DEVELOPMENT",
  PRINTING = "PRINTING",
  HOSTING = "HOSTING",
}

export enum ServiceType {
  MEETINGS_CALLS = "MEETINGS_CALLS",
  EMAIL_COMMUNICATION = "EMAIL_COMMUNICATION",
  TRAINING_WORKSHOPS = "TRAINING_WORKSHOPS",
  STRATEGY_PLANNING = "STRATEGY_PLANNING",
  TECHNICAL_DOCS = "TECHNICAL_DOCS",
  LOGO_DESIGN = "LOGO_DESIGN",
  WEBSITE_DESIGN = "WEBSITE_DESIGN",
  CUSTOM_DEV = "CUSTOM_DEV",
  WEB_SHOP = "WEB_SHOP",
  IT_APP = "IT_APP",
  MODEL_3D = "MODEL_3D",
  PRINT_3D = "PRINT_3D",
  HOSTING = "HOSTING",
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  addresses: Address[];
  orders: Order[];
  invoices: Invoice[];
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
}

export interface Order {
  id: string;
  orderDate: Date;
  total: number;
  status: string;
  customerId: string;
  customer: Customer;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: Product;
  orderId: string;
  order: Order;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  category: Category;
  orderItems: OrderItem[];
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface Invoice {
  id: string;
  invoiceDate: Date;
  amount: number;
  status: string;
  customerId: string;
  customer: Customer;
}

export interface PrintJob {
  id: string;
  createdAt: Date;
  scheduledDate: Date;
  completed: boolean;
  ordered: boolean;
  quantity: number;
  product: string;
  printType: PrintType;
  material: PrintMaterial;
  materialId: string;
  color: string;
  printTime: number;
  weight: number;
  totalPrice: number;
  suggestedPrice: number;
}

export interface PrintMaterial {
  id: string;
  type: string;
  subType: string;
  stock: number;
  color: string;
  unitPrice: number;
  printJobs: PrintJob[];
}

export interface Project {
  id: string;
  name: string;
  client: string;
  createdAt: Date;
  timeLogs: TimeLog[];
}

export interface TimeLog {
  id: string;
  projectId: string;
  project: Project;
  startTime: Date;
  endTime?: Date;
  serviceType: ServiceType;
  category: ServiceCategory;
  hourlyRate: number;
  totalPrice?: number;
}

export interface ServicePrice {
  id: string;
  category: ServiceCategory;
  service: ServiceType;
  estimatedMin?: number;
  estimatedMax?: number;
  standardMin: number;
  standardMax: number;
  friendsMin: number;
  friendsMax: number;
}
