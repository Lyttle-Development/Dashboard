import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & { id: string };
  }

  interface User extends DefaultUser {
    id: string;
  }
}
