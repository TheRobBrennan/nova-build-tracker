import { pubsub, COMPONENT_STATUS_CHANGED } from '../pubsub';

export const subscriptionResolvers = {
  Subscription: {
    componentStatusChanged: {
      subscribe: () => pubsub.asyncIterator([COMPONENT_STATUS_CHANGED]),
      resolve: (payload: { componentStatusChanged: unknown }) =>
        payload.componentStatusChanged,
    },
  },
};
