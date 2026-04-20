import { queryResolvers } from './query';
import { mutationResolvers } from './mutation';
import { subscriptionResolvers } from './subscription';
import { componentResolvers } from './component';

export const resolvers = {
  ...queryResolvers,
  ...mutationResolvers,
  ...subscriptionResolvers,
  ...componentResolvers,
};
