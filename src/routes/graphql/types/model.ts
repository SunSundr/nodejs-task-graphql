import { PrismaClient, User, Post, MemberType, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

export type UUIDstr = string;

export type ProfileLoadArgs = { id?: UUIDstr; userId?: UUIDstr };

export type UserLoadArgs = {
  userSubscribedTo?: UUIDstr;
  subscribedToUser?: UUIDstr;
  users?: boolean;
  user?: UUIDstr;
};

export type Loaders = {
  memberTypeLoader: DataLoader<string, MemberType | null>;
  userLoaderPrime: DataLoader<UserLoadArgs, User[] | User | null>;
  profileLoader: DataLoader<ProfileLoadArgs, Profile | null>;
  postLoader: DataLoader<string, Post[]>;
};

export interface GraphQLContext {
  prisma: PrismaClient;
  loaders: Loaders;
}
