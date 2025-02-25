import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { logError, logInfo } from "./utils/logger";
import { loginRoute } from "./routes/login";
import { testRoute } from "./routes/test";

const server = fastify();

// Middleware ל-CORS
server.addHook(
  "onRequest",
  (request: FastifyRequest, reply: FastifyReply, done) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Access-Control-Allow-Methods", "GET,PATCH,PUT,POST,DELETE");
    reply.header("Access-Control-Expose-Headers", "Content-Length");
    reply.header(
      "Access-Control-Allow-Headers",
      "Accept, Authorization, x-auth-token, Content-Type, X-Requested-With, Range"
    );

    if (request.method === "OPTIONS") {
      reply.code(200).send();
    } else {
      done();
    }
  }
);

// טיפול בשגיאות כלליות
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err.name, err);
  logError("uncaughtException:" + err.name, err);
});

// רישום המסלולים בצורה בטוחה
server.register(loginRoute, { prefix: "/api/" });
server.register(testRoute, { prefix: "/api/test" });

// הפעלת השרת
server.listen({ port: 3001, host: "0.0.0.0" });
logInfo(`Server running at http://localhost:3001`);
