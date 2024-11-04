// http://[::1]:8000/docs/static/index.html#/
import { 
  GraphQLObjectType, 
  GraphQLSchema, 
  GraphQLBoolean, 
  // GraphQLString, 
  GraphQLNonNull, 
  GraphQLList, 
  // GraphQLInt, 
} from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { 
  UserType, 
  PostType, 
  ProfileType,
  MemberType,
  MemberTypeIdEnum,
  // GraphQLContext,
} from './types/types.js';
import { UUIDType } from './types/uuid.js';
import  { 
  CreateUserInput, 
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  ChangeProfileInput,
  ChangePostInput,
} from './types/mutation.js';
import { GraphQLContext, UUIDstr } from './types/model.js';


const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Fetch profile by ID
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: string }, context: GraphQLContext) => {
        // console.log('Fetching profile with id:', id);
        // return await context.prisma.profile.findUnique({ where: { id } });
        return await context.loaders.profileLoader.load({ id }); 
      },
    },

  // Fetch user by ID
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: string }, context: GraphQLContext) => {
        // console.log('UserType ID', id,  await loaders.userLoader.load(id)); // OK!!!
        // const users = await prisma.user.findMany({
        //   where: { id: { in: Array.from(userIds) } },
        // });
        return await context.prisma.user.findUnique({ where: { id } })
        // console.log('UserType ID', id, usr?.id);
        // console.log('UserType ID', id); // OK!!!
        // return await context.loaders.userLoader.load(id);
      },
    },

    // Fetch all users
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        // console.log('1) users');
        return await context.loaders.userLoaderPrime.load({ users: true });
        // const users = await context.prisma.user.findMany();
        // return await context.loaders.userLoader.loadMany(users.map(user => user.id));
        //return users;
      },
    },

    // Fetch all posts
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        const posts = await context.prisma.post.findMany();
        return await context.loaders.postLoader.loadMany(posts.map(post => post.authorId)); // -> postLoader !!!
      },
    },

    // Fetch post by ID
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: string }, context: GraphQLContext) => {
        // const posts = await context.loaders.postLoader.load(id); // array
        return await context.prisma.post.findUnique({ where: { id } }); // -> postLoader !!!
      },
    },

    // Fetch all member types
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        return await context.prisma.memberType.findMany(); // -> memberTypeLoader !!!
      },
    },

    // Fetch member type by ID
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) }, //  OK!!!
      },
      resolve: async (_sr, { id }: { id: UUIDstr }, context: GraphQLContext) => {
        // return await context.prisma.memberType.findUnique({ where: { id } });
        return context.loaders.memberTypeLoader.load(id);
      },
    },

    // Fetch all profiles
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

//--------------------------------------------------------------------------------
const MutationType = new GraphQLObjectType({
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

   /*  type: PostType,
    args: {
      dto: { type: new GraphQLNonNull(CreatePostInput) },
    },
    resolve: async (_, { dto }) => {
      return await prisma.post.create({ data: dto });
    }, */
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

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
