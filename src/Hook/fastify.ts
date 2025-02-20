import fastify from "fastify";
import { AsyncLocalStorage } from "async_hooks";
const server = fastify();

const asyncStorage = new AsyncLocalStorage<Map<string, any>>();

export function setRequestContext(loginUser: string) {
  asyncStorage.run(new Map(), () => {
    const store = asyncStorage.getStore();
    if (store) {
      store.set("loginUser", loginUser);
    }
  });
}

export function getRequestContext(): { loginUser: string } {
  const store = asyncStorage.getStore();
  return {
    loginUser: store?.get("loginUser") || "AFRICA",
  };
}

server.addHook("preHandler", async (request, reply) => {
  const userId = (request.headers["x-login-user"] as string) || "AFRICA";
  setRequestContext(userId);
});
