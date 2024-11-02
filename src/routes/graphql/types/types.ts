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
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './uuid.js';
import { Loaders } from '../loaders.js';

const prisma = new PrismaClient();

// const UUIDType = GraphQLString; // TEST

export interface UserDto {
  id: string;
  name: string;
  balance: number;
}

export interface PostDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface ProfileDto {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
}

export interface ProfileDto {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
}

export interface Member {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

const MemberTypeIdEnum = new GraphQLEnumType({ // use import !!!
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    posts: { 
      type: new GraphQLList(PostType),
      resolve: async (user: UserDto) => {
        return await prisma.post.findMany({ where: { authorId: user.id } });
      },
    },
    profile: {
      type:  ProfileType, // OK !!!
      resolve: async (user: UserDto) => {
        // console.log('ProfileType');
        return await prisma.profile.findUnique({ where: { userId: user.id } });
      },
    },
    
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user: UserDto) => {
        // console.log(' ****');
        // console.log('1)', user.id);
        // const result = await prisma.user.findMany({
        //   where: {
        //     userSubscribedTo: {
        //       some: {
        //         authorId: user.id,
        //       },
        //     },
        //   },
        // });
        // console.log('*)', result[0]?.id);

       /*  return prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: user.id,
              },
            },
          },
        }); */

        const subscriptions = prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: user.id,
              },
            },
          },
        });
        
        return subscriptions || [];

        // return await prisma.user.findMany({
        //   where: {
        //     userSubscribedTo: {
        //       some: {
        //         subscriberId: user.id,
        //       },
        //     },
        //   },
        // });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user: UserDto) => {

        const result = await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: user.id,
              },
            },
          },
        });

        return result;
        // return prisma.user.findMany({
        //   where: {
        //     subscribedToUser: {
        //       some: {
        //         subscriberId: user.id,
        //       },
        //     },
        //   },
        // });
        // return await prisma.user.findMany({
        //   where: {
        //     subscribedToUser: {
        //       some: {
        //         authorId: user.id,
        //       },
        //     },
        //   },
        // });
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
      resolve: async (post: PostDto) => {
        // console.log('UserType'); // ???
        return await prisma.user.findUnique({ where: { id: post.authorId } });
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
      resolve: async (profile, _, { loaders }: { loaders: Loaders }) => {
        return await loaders.memberTypeLoader.load(profile.memberTypeId);
      },
    },
    user: {
      type: UserType,
      resolve: async (profile: ProfileDto) => {
        // console.log('Profile > user'); // ???
        return await prisma.user.findUnique({ where: { id: profile.userId } });
      },
    },
  },
});

export { UserType, PostType, ProfileType, MemberType, MemberTypeIdEnum };
