import { createSoapClient } from "@/lib/yuki/soap";
import { yukiConfig } from "@/lib/yuki/config";
import { InvoiceData } from "@/lib/types/yuki";

async function createInvoice(invoiceData: InvoiceData): Promise<any> {
  const client = await createSoapClient(yukiConfig.salesEndpoint);
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
