import { PrismaClient } from '@prisma/client';
import { QueryResolvers, MutationResolvers  } from './types/model.js'

const prisma = new PrismaClient();

export const resolvers: { Query: QueryResolvers; Mutation: MutationResolvers } = {
  Query: {
    users: async () => {
      return await prisma.user.findMany({
        include: {
          posts: true,
          profile: { include: { memberType: true } },
          userSubscribedTo: true,
          subscribedToUser: true,
        },
      });
    },
  },
  Mutation: {
    createUser: async (_, { dto }) => {
      return await prisma.user.create({ data: dto });
      /*
        name: string;
        balance: number;
        id: string;
      */
    },
    createPost: async (_, { dto }) => {
      return await prisma.post.create({ data: dto });
      /* 
      id: string;
      title: string;
      content: string;
      authorId: string; 
      */
    
    },
    createProfile: async (_, { dto }) => {
      return await prisma.profile.create({ data: dto });
        /* {
        id: string;
        isMale: boolean;
        yearOfBirth: number;
        memberTypeId: string;
        userId: string;
    } */
    },
    deleteUser: async (_, { id }) => {
      await prisma.user.delete({ where: { id } });
      // url: '/:userId',
      return true;
    },
  },
};