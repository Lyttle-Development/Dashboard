import * as soap from "soap";

async function createCustomer(
  config: YukiConfig,
  customerData: CustomerData,
): Promise<any> {
  // Create SOAP client for the Contact webservice
  const client = await soap.createClientAsync(config.contactEndpoint);

  // Add SOAP header with your credentials
  client.addSoapHeader({
    APIKey: config.apiKey,
    CompanyID: config.companyId,
  });

  // Build the request according to Yuki's Contact schema.
  const requestParams = {
    Contact: {
      Name: customerData.customerName,
      Address: customerData.address,
      // Include other required fields...
    },
  };

  // Call the method to create a customer (actual method name may vary)
  const [result] = await client.CreateContactAsync(requestParams);
  return result;
}
