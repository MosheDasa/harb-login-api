// ./routes/dasa.ts
import { FastifyInstance } from "fastify";
import { MailHelper } from "../helper/email-helper";
import { redisHelper } from "../helper/redis-helper";
import { logDebug, logError, logInfo } from "../utils/logger";

export async function testRoute(server: FastifyInstance) {
  server.get("/isOk", async (request, reply) => {
    reply.send({ message: "ok route works!" });
  });

  server.get("/mail", async (request, reply) => {
    const aa = await MailHelper.getPassFromMail();
    reply.send({ message: "ok route works!", code: aa });
  });

  server.get("/testRedis", async (request, reply) => {
    await redisHelper.set("routeKey", "Hello from route!", 60);
    const value = await redisHelper.get("routeKey");
    return { value };
  });

  server.get("/dasa", async (request, reply) => {
    logInfo("logInfo dasa");
    logError("logError dasa");
    logDebug("logDebug dasa");
    return { isSuccess: "OK" };
  });

  server.get("/getCookies", async (request, reply) => {
    const value = await redisHelper.get("cookies");
    return { value };
  });
}
