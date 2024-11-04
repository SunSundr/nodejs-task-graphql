import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLEnumType,
} from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { UUIDType } from './uuid.js';
import { GraphQLContext } from './model.js';
import { MemberTypeId } from '../../member-types/schemas.js';

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: Object.keys(MemberTypeId).reduce(
    (acc, key) => {
      if (Object.prototype.hasOwnProperty.call(MemberTypeId, key)) {
        acc[key] = { value: (MemberTypeId as { [key: string]: string })[key] };
      }
      return acc;
    },
    {} as Record<string, { value: string }>,
  ),
});

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (user: User, _cn, context: GraphQLContext) => {
        return await context.loaders.postLoader.load(user.id);
        // return await context.prisma.post.findMany({ where: { authorId: user.id } });
      },
    },
    profile: {
      type: ProfileType, // OK !!!
      resolve: async (user: User, _cn, context: GraphQLContext) => {
        return await context.loaders.profileLoader.load({ userId: user.id });
        // return await context.prisma.profile.findUnique({ where: { userId: user.id } });
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user: User, _cn, context: GraphQLContext) => {
        return await context.loaders.userLoaderPrime.load({ subscribedToUser: user.id });
        // const subscriptions: User[] = await context.prisma.user.findMany({
        //   where: {
        //     subscribedToUser: {
        //       some: {
        //         subscriberId: user.id,
        //       },
        //     },
        //   },
        // });
        // return subscriptions;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user: User, _cn, context: GraphQLContext) => {
        return await context.loaders.userLoaderPrime.load({ userSubscribedTo: user.id });
        // const result: User[] = await context.prisma.user.findMany({
        //   where: {
        //     userSubscribedTo: {
        //       some: {
        //         authorId: user.id,
        //       },
        //     },
        //   },
        // });
        // return result;
      },
    },
  }),
});

const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
    author: {
      type: UserType,
      resolve: async (post: Post, _cn, context: GraphQLContext) => {
        return await context.loaders.postLoader.load(post.authorId);
        // return await context.prisma.user.findUnique({ where: { id: post.authorId } });
      },
    },
  },
});

const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (profile: Profile, _cn, context: GraphQLContext) => {
        return await context.loaders.memberTypeLoader.load(profile.memberTypeId);
        // return await context.prisma.memberType.findUnique({ where: { id: profile.memberTypeId } });
      },
    },
    user: {
      type: UserType,
      resolve: async (profile: Profile, _cn, context: GraphQLContext) => {
        return await context.loaders.userLoaderPrime.load({ user: profile.userId });
        // return await context.prisma.user.findUnique({ where: { id: profile.userId } });
      },
    },
  },
});

export { UserType, PostType, ProfileType, MemberType, MemberTypeIdEnum };