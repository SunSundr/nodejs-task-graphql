import { PrismaClient, User, Post, MemberType, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

export type UUIDstr = string;

export type ProfileLoadArgs = { id?: string; userId?: string };

export type SubscriptionLoadArgs = { // remove
  userSubscribedTo?: string;
  subscribedToUser?: string;
};

export type UserLoadArgs = {
  userSubscribedTo?: string;
  subscribedToUser?: string;
  users?: boolean;
  user?: string;
};


export type Loaders = {
  userLoader?: DataLoader<string, User | null>; // remove
  postLoader: DataLoader<string, Post[]>;
  memberTypeLoader: DataLoader<string, MemberType | null>;
  profileLoader: DataLoader<ProfileLoadArgs, Profile | null>;
  subscriptionLoader: DataLoader<SubscriptionLoadArgs, User[]>; // remove
  userLoaderPrime: DataLoader<UserLoadArgs, User[] | User | null>;
};

export interface GraphQLContext {
  prisma: PrismaClient;
  loaders: Loaders;
}
