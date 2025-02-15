export async function debugBuffer() {
  // Start a timeout of x seconds. based on env variable
  const timeout =
    (process.env.BUFFER_TIMEOUT ? parseInt(process.env.BUFFER_TIMEOUT) : 0) ||
    0; // default: disabled

  if (timeout > 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, timeout);
    });
  }

  return true;
}
