interface YukiConfig {
  apiKey: string;
  companyId: string;
  // Endpoint for Sales webservice (used for invoices & product creation)
  salesEndpoint: string;
  // Endpoint for Contact webservice (used for customers)
  contactEndpoint: string;
}

interface CustomerData {
  customerName: string;
  address?: string;
  // Add additional fields as required by Yuki’s API.
}

interface ProductData {
  productCode: string;
  productName: string;
  price: number;
  vatPercentage: number;
  // Other product fields may be added here.
}

interface InvoiceLine {
  productCode: string; // should match the code of the product created
  description: string;
  quantity: number;
  unitPrice: number;
  vatPercentage: number;
}

interface InvoiceData {
  customerId: string; // ID obtained after creating the customer
  invoiceDate: string; // ISO string format
  dueDate: string; // ISO string format
  lines: InvoiceLine[];
  // Add any additional invoice header fields as required.
}
