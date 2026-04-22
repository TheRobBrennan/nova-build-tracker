import { vi } from 'vitest';

// Mock GraphQL operations
export const mockUseQuery = vi.fn();
export const mockUseMutation = vi.fn();
export const mockUseSubscription = vi.fn();

// Mock Apollo Client hooks
vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useSubscription: mockUseSubscription,
  gql: vi.fn((template: TemplateStringsArray) => template.join('')),
}));

// Mock GraphQL operations
vi.mock('../graphql/queries', () => ({
  GET_COMPONENTS: 'GET_COMPONENTS',
}));

vi.mock('../graphql/mutations', () => ({
  UPDATE_COMPONENT_STATUS: 'UPDATE_COMPONENT_STATUS',
  CREATE_COMPONENT: 'CREATE_COMPONENT',
}));

vi.mock('../graphql/subscriptions', () => ({
  COMPONENT_STATUS_CHANGED: 'COMPONENT_STATUS_CHANGED',
}));
