import { createSoapClient } from "@/lib/yuki/soap";

async function createInvoice(
  config: YukiConfig,
  invoiceData: InvoiceData,
): Promise<any> {
  const client = await createSoapClient(config.salesEndpoint, config);
  const requestParams = {
    Invoice: {
      CustomerID: invoiceData.customerId,
      InvoiceDate: invoiceData.invoiceDate,
      DueDate: invoiceData.dueDate,
      InvoiceLines: invoiceData.lines.map((line) => ({
        ProductCode: line.productCode,
        Description: line.description,
        Quantity: line.quantity,
        UnitPrice: line.unitPrice,
        VATPercentage: line.vatPercentage,
      })),
    },
  };
  const [result] = await client.CreateInvoiceAsync(requestParams);
  return result;
}
