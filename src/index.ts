import fastify from "fastify";
import { logError, logInfo } from "./utils/logger";
import { loginRoute } from "./routes/login";
import { testRoute } from "./routes/test";

const server = fastify();

async function startServer() {
  try {
    logInfo("Registering routes...");

    // רישום המסלולים בצורה בטוחה
    await server.register(loginRoute);
    logInfo("Login route registered successfully.");

    await server.register(testRoute);
    logInfo("Test route registered successfully.");

    // הפעלת השרת
    await server.listen({ port: 3000, host: "0.0.0.0" });
    logInfo(`Server running at http://localhost:3000`);
  } catch (error) {
    logError("Failed to start server:", { error });
    process.exit(1);
  }
}

startServer();
