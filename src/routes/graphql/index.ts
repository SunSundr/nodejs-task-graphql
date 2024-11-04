import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import { schema } from './schema.js';
import { 
  createUserLoader,
  createPostLoader,
  createMemberTypeLoader,
  createProfileLoader,
  createSubscriptionLoader,
} from './loaders.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const initLoaders = () => {
    return {
      userLoader: createUserLoader(prisma),
      postLoader: createPostLoader(prisma),
      memberTypeLoader: createMemberTypeLoader(prisma),
      profileLoader: createProfileLoader(prisma),
      subscriptionLoader: createSubscriptionLoader(prisma),
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
      

      const response = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma, loaders: initLoaders() },
      });
      return response;
    },
  });
};

export default plugin;
