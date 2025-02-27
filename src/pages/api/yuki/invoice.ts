import * as soap from "soap";

async function createInvoice(
  config: YukiConfig,
  invoiceData: InvoiceData,
): Promise<any> {
  // Create the SOAP client for the Sales webservice
  const client = await soap.createClientAsync(config.salesEndpoint);

  client.addSoapHeader({
    APIKey: config.apiKey,
    CompanyID: config.companyId,
  });

  // Construct the invoice payload according to Yuki's schema.
  const requestParams = {
    Invoice: {
      CustomerID: invoiceData.customerId,
      InvoiceDate: invoiceData.invoiceDate,
      DueDate: invoiceData.dueDate,
      // Additional header fields as needed...
      InvoiceLines: invoiceData.lines.map((line) => ({
        ProductCode: line.productCode,
        Description: line.description,
        Quantity: line.quantity,
        UnitPrice: line.unitPrice,
        VATPercentage: line.vatPercentage,
      })),
    },
  };

  // Call the method to create the invoice (replace 'CreateInvoice' with the actual method name)
  const [result] = await client.CreateInvoiceAsync(requestParams);
  return result;
}
