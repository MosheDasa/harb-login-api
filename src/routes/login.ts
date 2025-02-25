import { FastifyInstance } from "fastify";
import { LogingController } from "../controller/loging-controller";

export async function loginRoute(fastify: FastifyInstance) {
  fastify.get("login", async (request, reply) => {
    const result = await LogingController.login();
    return result;
  });
}
