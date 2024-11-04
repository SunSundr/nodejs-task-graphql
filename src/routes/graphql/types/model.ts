import { PrismaClient, User, Post, MemberType, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

export type UUIDstr = string;

export type ProfileLoadArgs = { id?: string; userId?: string };

export type SubscriptionLoadArgs = {
  userSubscribedTo?: string;
  subscribedToUser?: string;
};

export type Loaders = {
  userLoader: DataLoader<string, User | null>;
  postLoader: DataLoader<string, Post[]>;
  memberTypeLoader: DataLoader<string, MemberType[]>;
  profileLoader: DataLoader<ProfileLoadArgs, Profile>;
  subscriptionLoader: DataLoader<SubscriptionLoadArgs, User[]>;
};

export interface GraphQLContext {
  prisma: PrismaClient;
  loaders: Loaders;
}
