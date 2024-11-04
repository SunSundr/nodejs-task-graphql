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
      resolve: async (_sr, { id }: { id: string }, context: GraphQLContext) => {
        // console.log('Fetching profile with id:', id);
        // return await context.prisma.profile.findUnique({ where: { id } });
        return await context.loaders.profileLoader.load({ id }); 
      },
    },

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

    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        const posts = await context.prisma.post.findMany();
        return await context.loaders.postLoader.loadMany(posts.map(post => post.authorId)); // -> postLoader !!!
      },
    },

    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_sr, { id }: { id: string }, context: GraphQLContext) => {
        // const posts = await context.loaders.postLoader.load(id); // array
        return await context.prisma.post.findUnique({ where: { id } }); // -> postLoader !!!
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_sr, __, context: GraphQLContext) => {
        return await context.prisma.memberType.findMany(); // -> memberTypeLoader !!!
      },
    },

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
