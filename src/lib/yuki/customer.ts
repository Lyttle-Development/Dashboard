import { createSoapClient } from "@/lib/yuki/soap";

async function searchCustomer(
  config: YukiConfig,
  customerName: string,
): Promise<any | null> {
  const client = await createSoapClient(config.contactEndpoint, config);
  // Build request parameters based on Yuki's search schema.
  const searchParams = { SearchCriteria: { Name: customerName } };
  // Assume a method "SearchContact" exists.
  const [result] = await client.SearchContactAsync(searchParams);
  // Process result and return the customer if found.
  if (result && result.Contact && result.Contact.length > 0) {
    return result.Contact[0]; // Return the first match
  }
  return null;
}

async function createCustomer(
  config: YukiConfig,
  customerData: CustomerData,
): Promise<any> {
  const client = await createSoapClient(config.contactEndpoint, config);
  const requestParams = {
    Contact: {
      Name: customerData.customerName,
      Address: customerData.address,
      // ... other fields as required
    },
  };
  const [result] = await client.CreateContactAsync(requestParams);
  return result;
}

async function ensureCustomer(
  config: YukiConfig,
  customerData: CustomerData,
): Promise<string> {
  const existing = await searchCustomer(config, customerData.customerName);
  if (existing) {
    console.log("Customer already exists:", existing.ContactID);
    return existing.ContactID;
  } else {
    const newCustomer = await createCustomer(config, customerData);
    console.log("Created new customer:", newCustomer.ContactID);
    return newCustomer.ContactID;
  }
}
