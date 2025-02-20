import { AsyncLocalStorage } from "async_hooks";

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
