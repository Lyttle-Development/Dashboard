import { YukiConfig } from "@/lib/types/yuki";

export const yukiConfig: YukiConfig = {
  apiKey: (process.env.YUKI_API_KEY as string) || "",
  companyId: (process.env.YUKI_COMPANY_ID as string) || "",
  salesEndpoint: (process.env.YUKI_SALES_ENDPOINT as string) || "",
  contactEndpoint: (process.env.YUKI_CONTACT_ENDPOINT as string) || "",
} as const;
