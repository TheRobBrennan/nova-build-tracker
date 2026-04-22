import { ApolloClient, InMemoryCache, split, HttpLink, from, NormalizedCacheObject } from '@apollo/client';
import { persistCache } from 'apollo3-cache-persist';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const HTTP_URL = '/graphql';
const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/graphql`;

const httpLink = new HttpLink({ uri: HTTP_URL });

const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: { max: 15, retryIf: (error) => !!error },
});

interface WsStore {
  isConnected: boolean;
  hasConnectedBefore: boolean;
  connected: Set<() => void>;
  disconnected: Set<() => void>;
}

declare global {
  interface Window { __wsStore?: WsStore; }
}

const store: WsStore = window.__wsStore ?? (window.__wsStore = {
  isConnected: false,
  hasConnectedBefore: false,
  connected: new Set(),
  disconnected: new Set(),
});

export function getWsConnected(): boolean {
  return store.isConnected;
}

export function subscribeToWsState(
  onConnected: () => void,
  onDisconnected: () => void
): () => void {
  store.connected.add(onConnected);
  store.disconnected.add(onDisconnected);
  return () => {
    store.connected.delete(onConnected);
    store.disconnected.delete(onDisconnected);
  };
}

export const wsClient = createClient({
  url: WS_URL,
  shouldRetry: () => true,
  retryAttempts: Infinity,
  on: {
    connecting: () => {
      console.log('[ws] connecting — hasConnectedBefore:', store.hasConnectedBefore, 'isConnected:', store.isConnected);
      if (store.hasConnectedBefore && store.isConnected) {
        store.isConnected = false;
        store.disconnected.forEach((fn) => fn());
      }
    },
    connected: () => {
      console.log('[ws] connected — listeners:', store.connected.size);
      store.hasConnectedBefore = true;
      store.isConnected = true;
      store.connected.forEach((fn) => fn());
    },
    error: (err) => console.error('[graphql-ws] error:', err),
  },
});

const wsLink = new GraphQLWsLink(wsClient);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  from([retryLink, httpLink])
);

const cache = new InMemoryCache();

// Persist cache to localStorage for smooth reloads
persistCache({
  cache,
  storage: localStorage,
  key: 'nova-build-tracker-cache',
});

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  ssrMode: false,
});

wsClient.on('connected', () => {
  // Smooth refetch - no flash, just updates in background
  apolloClient.reFetchObservableQueries().catch(() => {
    // Silently handle errors - we'll retry via RetryLink
  });
});
