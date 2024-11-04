import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, validate, parse, GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { schema } from './schema-graphql.js';
import { createUserLoaderPrime } from './loaders/userPrime-loader.js';
import { createMemberTypeLoader } from './loaders/memberType-loader.js';
import { createPostLoader } from './loaders/post-loader.js';
import { createProfileLoader } from './loaders/profile-loader.js';
import { Loaders } from './types/model.js';
import { parseQueryKeys, HasQueryKeys } from './parse-query.js';

const DEPTH_LIMIT = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const initLoaders = (queryKeys: HasQueryKeys): Loaders => {
    return {
      postLoader: createPostLoader(prisma),
      memberTypeLoader: createMemberTypeLoader(prisma),
      profileLoader: createProfileLoader(prisma),
      userLoaderPrime: createUserLoaderPrime(prisma, queryKeys),
    };
  };

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: { 200: gqlResponseSchema },
    },
    async handler(req) {
      try {
        const { query, variables } = req.body;
        const parsedQuery = parse(query);
        const validationErrors = validate(schema, parsedQuery, [depthLimit(DEPTH_LIMIT)]);
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
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown GraphQL error';
        console.error('GraphQL Error:', msg);
        return { errors: [new GraphQLError(msg)] };
      }
    },
  });
};

export default plugin;
