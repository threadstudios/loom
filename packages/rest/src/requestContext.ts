import { AsyncLocalStorage } from "node:async_hooks";

// Define the shape of your request context store
export interface RequestContextStore {
  [key: string]: unknown;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContextStore>();

export const requestContext = {
  get: <T = unknown>(key: string): T | undefined => {
    const store = asyncLocalStorage.getStore();
    return store ? (store[key] as T) : undefined;
  },
  set: <T>(key: string, value: T): void => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  },
  getStore: (): RequestContextStore | undefined => {
    return asyncLocalStorage.getStore();
  },
};
