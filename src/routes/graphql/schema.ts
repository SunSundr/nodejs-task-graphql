// http://[::1]:8000/docs/static/index.html#/
import { 
  GraphQLObjectType, 
  GraphQLSchema, 
  GraphQLBoolean, 
  GraphQLString, 
  GraphQLNonNull, 
  GraphQLList, 
  GraphQLInt, 
} from 'graphql';
import { 
  UserType, 
  PostType, 
  ProfileType,
  MemberType,
  MemberTypeIdEnum,
} from './types/types.js';
import { PrismaClient } from '@prisma/client';
// import DataLoader from 'dataloader';
import { UUIDType } from './types/uuid.js';
// import { User, Post } from '@prisma/client';
import { Loaders  } from './loaders.js';

const prisma = new PrismaClient();

// const UUIDType = GraphQLString;

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Fetch profile by ID
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }) => {
        // console.log('Fetching profile with id:', id);
        const profile = await prisma.profile.findUnique({ where: { id } });
        // console.log('Fetched profile:', profile?.id);
        return profile;
        // return await prisma.profile.findUnique({ where: { id } });
      },
    },

  // Fetch user by ID
  user: {
    type: UserType,
    args: { id: { type: new GraphQLNonNull(UUIDType) } },
    resolve: async (_, { id }: { id: string }, { loaders }: { loaders: Loaders }) => {
      // console.log('UserType ID', id,  await loaders.userLoader.load(id)); // OK!!!
      // const users = await prisma.user.findMany({
      //   where: { id: { in: Array.from(userIds) } },
      // });

      const usr = await prisma.user.findUnique({ where: { id } })
      // console.log('UserType ID', id, usr?.id);
      return usr;
      // console.log('UserType ID', id); // OK!!!
      // return await loaders.userLoader.load(id);
    },
  },

    // Fetch all users
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, { loaders }: { loaders: Loaders }) => {
        const users = await prisma.user.findMany();
        return await loaders.userLoader.loadMany(users.map(user => user.id));
      },
    },

    // Fetch all posts
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, { loaders }: { loaders: Loaders }) => {
        const posts = await prisma.post.findMany();
        // console.log('POSTS', await loaders.postLoader.loadMany(posts.map(post => post.authorId)));
        return await loaders.postLoader.loadMany(posts.map(post => post.authorId));
      },
    },

    // Fetch post by ID
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }) => {
        return await prisma.post.findUnique({ where: { id } });
      },
    },

    // Fetch all member types
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async () => {
        // console.log('memberTypes');
        return await prisma.memberType.findMany();
      },
    },

    // Fetch member type by ID
    memberType: {
      type: MemberType,
      // args: { id: { type: new GraphQLNonNull(UUIDType) } },
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) }, //  OK!!!
      },
      resolve: async (_, { id }: { id: string }, { loaders }: { loaders: Loaders }) => {
        // const vvvvv = await prisma.memberType.findUnique({ where: { id } });
        return await prisma.memberType.findUnique({ where: { id } });
        // return loaders.memberTypeLoader.load(id);
      },
      // resolve: async (profile, _, { loaders }) => {
      //   return profile.memberTypeId 
      //     ? loaders.memberTypeLoader.load(profile.memberTypeId)
      //     : null;
      // },
    },

    // Fetch all profiles
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async () => {
        // console.log('>>> profiles'); // ???
        return await prisma.profile.findMany();
      },
    },
  },
});

//--------------------------------------------------------------------------------
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: new GraphQLList(UserType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { name, balance }) => {
        return await prisma.user.create({ data: { name, balance } });
      },
    },
    createPost: {
      type: new GraphQLList(PostType),
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { title, content, authorId }) => {
        return await prisma.post.create({ data: { title, content, authorId } });
      },
    },
    subscribeToUser: {
      type: new GraphQLList(UserType),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }) => {
        await prisma.subscribersOnAuthors.create({
          data: { subscriberId: userId, authorId },
        });
        return prisma.user.findUnique({ where: { id: userId } });
      },
    },
    unsubscribeFromUser: {
      type: new GraphQLList(UserType),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: { subscriberId: userId, authorId },
          },
        });
        return prisma.user.findUnique({ where: { id: userId } });
      },
    },
    updateProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id, isMale, yearOfBirth }) => {
        return await prisma.profile.update({
          where: { id },
          data: { isMale, yearOfBirth },
        });
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

