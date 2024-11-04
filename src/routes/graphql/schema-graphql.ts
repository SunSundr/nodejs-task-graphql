import { GraphQLSchema } from 'graphql';
import { QueryType } from './types/query.js';
import { MutationType } from './types/mutation.js';

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
