import * as soap from "soap";

async function createProduct(
  config: YukiConfig,
  productData: ProductData,
): Promise<any> {
  // Create SOAP client for the Sales webservice (or specific product service if available)
  const client = await soap.createClientAsync(config.salesEndpoint);

  client.addSoapHeader({
    APIKey: config.apiKey,
    CompanyID: config.companyId,
  });

  // Build the request payload per Yuki’s product schema.
  const requestParams = {
    Product: {
      Code: productData.productCode,
      Name: productData.productName,
      Price: productData.price,
      VATPercentage: productData.vatPercentage,
      // Add any additional fields as required.
    },
  };

  // Call the method to create the product (actual method name may differ)
  const [result] = await client.CreateProductAsync(requestParams);
  return result;
}
