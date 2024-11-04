import { PrismaClient, User, Post, Profile, MemberType } from '@prisma/client';
import DataLoader from 'dataloader';
import { ProfileLoadArgs, UserLoadArgs } from './types/model.js';
import { HasQueryKeys } from './parse-query.js';

// Posts
//-------------------------------------------------------------------------------------------------
export const createPostLoader = (prisma: PrismaClient) =>
  new DataLoader(async (authorIds: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: Array.from(authorIds) } },
    });
    const postsMap = new Map<string, Post[]>(authorIds.map((authorId) => [authorId, []]));
    posts.forEach((post) => {
      if (postsMap.has(post.authorId)) {
        postsMap.get(post.authorId)?.push(post);
      }
    });
    return authorIds.map((authorId) => postsMap.get(authorId) || []);
  });

// MemberType
//-------------------------------------------------------------------------------------------------
export const createMemberTypeLoader = (prisma: PrismaClient) =>
  new DataLoader(async (memberTypeIds: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: Array.from(memberTypeIds) } },
    });
    const memberTypeMap = new Map<string, MemberType>(
      memberTypes.map((type) => [type.id, type]),
    );
    return memberTypeIds.map((id) => memberTypeMap.get(id) || null);
  });

// UserLoaderPrime
//-------------------------------------------------------------------------------------------------
export const createUserLoaderPrime = (
  prisma: PrismaClient,
  queryKeys: HasQueryKeys = {},
) => {
  const userSubscribedToCache = new Map<string, Map<string, User>>();
  const subscribedToUserCache = new Map<string, Map<string, User>>();
  let allUsersCache: User[] | null = null;

  const toUser = (user: User) => {
    return { id: user.id, name: user.name, balance: user.balance };
  };

  const setToMap = (
    cache: Map<string, Map<string, User>>,
    mapKey: string,
    user: User,
  ) => {
    if (!cache.has(mapKey)) cache.set(mapKey, new Map());
    cache.get(mapKey)!.set(user.id, toUser(user));
  };

  return new DataLoader<UserLoadArgs, User[] | User | null>(async (keys) => {
    if (
      userSubscribedToCache.size === 0 &&
      subscribedToUserCache.size === 0 &&
      allUsersCache === null
    ) {
      const allSubscriptions = await prisma.user.findMany({
        include: {
          ...(queryKeys.hasUserSubscribedToKey ? { userSubscribedTo: true } : {}),
          ...(queryKeys.hasSubscribedToUserKey ? { subscribedToUser: true } : {}),
        },
      });

      if (queryKeys.hasUsersKey || queryKeys.hasUserKey)
        allUsersCache = allSubscriptions.map(toUser);

      for (const user of allSubscriptions) {
        if (queryKeys.hasSubscribedToUserKey) {
          for (const subscription of user.subscribedToUser) {
            setToMap(subscribedToUserCache, subscription.subscriberId, user);
          }
        }
        if (queryKeys.hasUserSubscribedToKey) {
          for (const author of user.userSubscribedTo) {
            setToMap(userSubscribedToCache, author.authorId, user);
          }
        }
      }
    }

    const results: (User | User[] | null)[] = [];
    for (const key of keys) {
      if (key.users) {
        results.push(allUsersCache || []);
      } else if (key.user) {
        const usr = allUsersCache?.find((u) => u.id === key.user) || null;
        results.push(usr);
      } else if (key.userSubscribedTo) {
        results.push(
          Array.from(
            userSubscribedToCache.get(String(key.userSubscribedTo))?.values() || [],
          ),
        );
      } else if (key.subscribedToUser) {
        results.push(
          Array.from(
            subscribedToUserCache.get(String(key.subscribedToUser))?.values() || [],
          ),
        );
      } else {
        results.push([]);
      }
    }

    return results;
  });
};

// ProfileLoader
//-------------------------------------------------------------------------------------------------
export const createProfileLoader = (prisma: PrismaClient) => {
  return new DataLoader<ProfileLoadArgs, Profile | null>(async (keys) => {
    const ids = keys.filter((key) => key.id).map((key) => key.id);
    const userIds = keys.filter((key) => key.userId).map((key) => key.userId);

    const profiles: Profile[] = await prisma.profile.findMany({
      where: {
        OR: [{ id: { in: ids as string[] } }, { userId: { in: userIds as string[] } }],
      },
    });

    const profileById = new Map<string, Profile>();
    const profileByUserId = new Map<string, Profile>();

    profiles.forEach((profile) => {
      if (profile.id) profileById.set(profile.id, profile);
      if (profile.userId) profileByUserId.set(profile.userId, profile);
    });

    return keys.map((key) => {
      if (key.id) return profileById.get(key.id) || null;
      if (key.userId) return profileByUserId.get(key.userId) || null;
      return null;
    });
  });
};
