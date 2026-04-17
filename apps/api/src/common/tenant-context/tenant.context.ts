import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export function getTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}
