import { AsyncLocalStorage } from 'async_hooks';

interface NamespaceData {
  requestId?: string;
  userId?: string;
  userIp?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export const initializeNamespace = (req: any, res: any, next: any) => {
  const store = new Map();
  
  const userId = res.locals.user?.id;
  if (userId) {
    store.set('userId', userId);
  }

  const requestId = Date.now().toString();
  store.set('requestId', requestId);
  
  const userIp = req.ip || req.connection.remoteAddress;
  store.set('userIp', userIp);
  
  asyncLocalStorage.run(store, () => {
    next();
  });
};

export const getNamespaceData = (): NamespaceData => {
  const store = asyncLocalStorage.getStore();
  
  if (!store) {
    return {};
  }
  
  return {
    requestId: store.get('requestId'),
    userId: store.get('userId'),
    userIp: store.get('userIp'),
  };
};