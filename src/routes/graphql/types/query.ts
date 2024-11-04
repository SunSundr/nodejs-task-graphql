import { GraphQLObjectType, GraphQLNonNull, GraphQLList } from 'graphql';
import {
  UserType,
  PostType,
  ProfileType,
  MemberType,
  MemberTypeIdEnum,
} from './object-types.js';
import { UUIDType } from './uuid.js';
import { GraphQLContext, UUIDstr } from './model.js';

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        return await context.loaders.profileLoader.load({ id });
        // return await context.prisma.profile.findUnique({ where: { id } });
      },
    },

    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        return await context.loaders.userLoaderPrime.load({ user: id });
        // return await context.prisma.user.findUnique({ where: { id } })
      },
    },

    users: {
      type: new GraphQLList(UserType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        return await context.loaders.userLoaderPrime.load({ users: true });
        //return await context.prisma.user.findMany();
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        const posts = await context.prisma.post.findMany();
        return await context.loaders.postLoader.loadMany(
          posts.map((post) => post.authorId),
        ); // TODO ->change postLoader (authorId + id)
      },
    },

    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        return await context.prisma.post.findUnique({ where: { id } }); // -> TODO change postLoader (authorId + id)
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        const memTypes = await context.prisma.memberType.findMany();
        return await context.loaders.memberTypeLoader.loadMany(
          memTypes.map((mtype) => mtype.id),
        );
        // return await context.prisma.memberType.findMany(); // -> TODO change memberTypeLoader
      },
    },

    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        return context.loaders.memberTypeLoader.load(id);
        // return await context.prisma.memberType.findUnique({ where: { id } });
      },
    },

    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_sr, _cn, context: GraphQLContext) => {
        // return await context.prisma.profile.findMany();
        const profiles = await context.prisma.profile.findMany();
        profiles.forEach((profile) => {
          context.loaders.profileLoader.prime({ id: profile.id }, profile);
          context.loaders.profileLoader.prime({ userId: profile.userId }, profile);
        });
        return profiles;
      },
    },
  },
});
