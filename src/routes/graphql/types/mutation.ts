import { GraphQLObjectType, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { UserType, PostType, ProfileType } from './object-types.js';
import { UUIDType } from './uuid.js';
import  { 
  CreateUserInput, 
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  ChangeProfileInput,
  ChangePostInput,
} from './input-types.js';
import { GraphQLContext, UUIDstr } from './model.js';

export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (_sr, { dto }: { dto: User }, context: GraphQLContext) => {
        return await context.prisma.user.create({ data: dto });
      },
    },

    createPost: {
      type: PostType,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (_sr, { dto }: { dto: Post }, context: GraphQLContext) => {
        return await context.prisma.post.create({ data: dto });
      },
    },

    createProfile: {
      type: ProfileType,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (_sr, { dto }: { dto: Profile }, context: GraphQLContext) => {
        return await context.prisma.profile.create({ data: dto });
      },
    },

    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        await context.prisma.user.delete({ where: { id } });
        return true;
      },
    },

    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        await context.prisma.post.delete({ where: { id } });
        return true;
      },
    },

    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        await context.prisma.profile.delete({ where: { id } });
        return true;
      },
    },

    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_sr, { id, dto }: { id: UUIDstr, dto: User }, context: GraphQLContext) => {
        return await context.prisma.user.update({
          where: { id },
          data: dto,
        });
      },
    },

    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_sr, { id, dto }: { id: UUIDstr, dto: Post }, context: GraphQLContext) => {
        // console.log("ID:", id, "DTO:", dto);
        return await context.prisma.post.update({
          where: { id },
          data: dto,
        });
      },
    },

    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_sr, { id, dto }: { id: UUIDstr, dto: Profile }, context: GraphQLContext) => {
        return await context.prisma.profile.update({
          where: { id },
          data: dto,
        });
      },
    },

    subscribeTo: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_sr, { userId, authorId }: { userId: UUIDstr, authorId: UUIDstr }, context: GraphQLContext) => {
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });
        return true;
      },
    },
    
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_sr, { userId, authorId }: { userId: UUIDstr, authorId: UUIDstr }, context: GraphQLContext) => {
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });
        return true;
      },
    },
  },
});
