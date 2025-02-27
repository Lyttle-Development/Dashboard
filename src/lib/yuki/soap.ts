import * as soap from "soap";

export async function createSoapClient(endpoint: string, config: YukiConfig) {
  const client = await soap.createClientAsync(endpoint);
  client.addSoapHeader({
    APIKey: config.apiKey,
    CompanyID: config.companyId,
  });
  return client;
}
