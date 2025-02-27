import * as soap from "soap";
import { yukiConfig } from "@/lib/yuki/config";

export async function createSoapClient(endpoint: string) {
  const client = await soap.createClientAsync(endpoint);
  client.addSoapHeader({
    APIKey: yukiConfig.apiKey,
    CompanyID: yukiConfig.companyId,
  });
  return client;
}
