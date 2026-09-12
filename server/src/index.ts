import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { assertStorageConfig } from "./utils/object-storage.js";

assertStorageConfig();

const app = await createApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(`Server listening on http://${env.HOST}:${env.PORT}`);
  app.log.info(
    env.R2_REQUIRED || env.NODE_ENV === "production"
      ? "Storage mode: R2 required"
      : "Storage mode: R2 optional (local/HMAC fallback allowed)",
  );
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
