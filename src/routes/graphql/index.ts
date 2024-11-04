import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import { schema } from './schema-graphql.js';
import { 
  createUserLoaderPrime,
  createUserLoader,
  createPostLoader,
  createMemberTypeLoader,
  createProfileLoader,
  createSubscriptionLoader,
} from './loaders.js';
import depthLimit from 'graphql-depth-limit';
import { Loaders } from './types/model.js';
import { parseQueryKeys, HasQueryKeys } from './parse-query.js';


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const initLoaders = (queryKeys: HasQueryKeys): Loaders => {
    return {
      userLoader: createUserLoader(prisma), // remove
      postLoader: createPostLoader(prisma),
      memberTypeLoader: createMemberTypeLoader(prisma),
      profileLoader: createProfileLoader(prisma),
      subscriptionLoader: createSubscriptionLoader(prisma),  // remove
      userLoaderPrime: createUserLoaderPrime(prisma, queryKeys),
    }
  }

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: { 200: gqlResponseSchema},
    },
    async handler(req) {
      const { query, variables } = req.body;

      const parsedQuery = parse(query);

      const validationErrors = validate(schema, parsedQuery, [depthLimit(5)]);
      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      }
      
      const queryKeys = parseQueryKeys(parsedQuery);

      const response = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma, loaders: initLoaders(queryKeys) },
      });
      return response;
    },
  });
};

export default plugin;
