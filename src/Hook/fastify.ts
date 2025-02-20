import fastify from "fastify";
import { AsyncLocalStorage } from "async_hooks";
const server = fastify();

const asyncStorage = new AsyncLocalStorage<Map<string, any>>();

export function setRequestContext(userId: string, operationCode: string) {
  asyncStorage.run(new Map(), () => {
    const store = asyncStorage.getStore();
    if (store) {
      store.set("userId", userId);
      store.set("operationCode", operationCode);
    }
  });
}

export function getRequestContext(): { userId: string; operationCode: string } {
  const store = asyncStorage.getStore();
  return {
    userId: store?.get("userId") || "guest",
    operationCode: store?.get("operationCode") || "none",
  };
}

server.addHook("preHandler", async (request, reply) => {
  const userId = (request.headers["x-user-id"] as string) || "guest";
  const operationCode =
    (request.headers["x-operation-code"] as string) || "none";

  setRequestContext(userId, operationCode);
});
