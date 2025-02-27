import { createSoapClient } from "@/lib/yuki/soap";
import { yukiConfig } from "@/lib/yuki/config";
import { ProductData } from "@/lib/types/yuki";

async function searchProduct(productCode: string): Promise<any | null> {
  const client = await createSoapClient(yukiConfig.salesEndpoint);
  const searchParams = { ProductSearch: { Code: productCode } };
  // Assume a method "SearchProduct" exists.
  const [result] = await client.SearchProductAsync(searchParams);
  if (result && result.Product && result.Product.length > 0) {
    return result.Product[0];
  }
  return null;
}

async function createProduct(productData: ProductData): Promise<any> {
  const client = await createSoapClient(yukiConfig.salesEndpoint);
  const requestParams = {
    Product: {
      Code: productData.productCode,
      Name: productData.productName,
      Price: productData.price,
      VATPercentage: productData.vatPercentage,
      // Add other product fields as required.
    },
  };
  const [result] = await client.CreateProductAsync(requestParams);
  return result;
}

async function ensureProduct(productData: ProductData): Promise<string> {
  const existing = await searchProduct(productData.productCode);
  if (existing) {
    console.log("Product exists:", existing.Code);
    return existing.Code;
  } else {
    const newProduct = await createProduct(productData);
    console.log("Created new product:", newProduct.Code);
    return newProduct.Code;
  }
}
