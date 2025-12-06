// Export types which can be safely used on client and server
export * from "./types";

// Only export the prisma client on the server side
// On the client side, this will be undefined (which is fine since it should never be used there)
const prisma =
  typeof window === "undefined" ? require("./client").default : undefined;

export default prisma;
