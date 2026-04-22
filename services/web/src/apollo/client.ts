import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const HTTP_URL = '/graphql';
const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/graphql`;

const httpLink = new HttpLink({ uri: HTTP_URL });

const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: { max: 5, retryIf: (error) => !!error },
});

export const wsClient = createClient({
  url: WS_URL,
  on: {
    connecting: () => console.log('[graphql-ws] connecting to', WS_URL),
    connected: () => console.log('[graphql-ws] connected'),
    error: (err) => console.error('[graphql-ws] error:', err),
    closed: (event) => console.warn('[graphql-ws] closed:', event),
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

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

wsClient.on('connected', () => {
  apolloClient.reFetchObservableQueries();
});
