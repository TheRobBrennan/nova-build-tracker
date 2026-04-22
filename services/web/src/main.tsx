import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClientPromise } from './apollo/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Wait for cache to be restored before rendering
apolloClientPromise.then((apolloClient: import('@apollo/client').ApolloClient<any>) => {
  createRoot(root).render(
    <StrictMode>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </StrictMode>
  );
});
