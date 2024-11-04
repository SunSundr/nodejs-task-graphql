import { PrismaClient, User, Post, Profile, MemberType } from '@prisma/client';
import DataLoader from 'dataloader';
import { ProfileLoadArgs, SubscriptionLoadArgs } from './types/model.js';

// User
export const createUserLoader = (prisma: PrismaClient) => new DataLoader(async (userIds: readonly string[]) => {
  console.log('@createUserLoader');
  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
  });
  const userMap = new Map<string, User>(users.map(user => [user.id, user]));
  // console.log('createUserLoader', userIds);
  return userIds.map(id => userMap.get(id) || null);
});

// Posts
export const createPostLoader = (prisma: PrismaClient) => new DataLoader(async (authorIds: readonly string[]) => {
  console.log('@createPostLoader');
  const posts = await prisma.post.findMany({
    where: { authorId: { in: Array.from(authorIds) } },
  });
  const postsMap = new Map<string, Post[]>(authorIds.map(authorId => [authorId, []]));
  posts.forEach(post => {
    if (postsMap.has(post.authorId)) {
      postsMap.get(post.authorId)?.push(post);
    }
  });
  return authorIds.map(authorId => postsMap.get(authorId) || []); 
});


// MemberType
export const createMemberTypeLoader = (prisma: PrismaClient) => new DataLoader(async (memberTypeIds: readonly string[]) => {
  console.log('@createMemberTypeLoader');
  const memberTypes = await prisma.memberType.findMany({
    where: { id: { in: Array.from(memberTypeIds) } },
  });
  // [
  //   { id: 'BASIC', discount: 2.3, postsLimitPerMonth: 10 },
  //   { id: 'BUSINESS', discount: 7.7, postsLimitPerMonth: 100 }
  // ]
  const memberTypeMap = new Map<string, MemberType>(memberTypes.map(type => [type.id, type]));
  return memberTypeIds.map(id => memberTypeMap.get(id) || null);
});


export const createSubscriptionLoader = (prisma: PrismaClient) => {
  const userSubscribedToCache = new Map<string, Map<string, User>>();
  const subscribedToUserCache = new Map<string, Map<string, User>>();

  const toUser = (user: User) => {
    return {id: user.id, name: user.name, balance: user.balance}
  };

  const setToMap = (cache: Map<string, Map<string, User>>, mapKey: string, user: User) => {
    if (!cache.has(mapKey)) cache.set(mapKey, new Map());
    cache.get(mapKey)!.set(mapKey, toUser(user));
  }

  return new DataLoader<SubscriptionLoadArgs, User[]>(async (keys) => {
    if (userSubscribedToCache.size === 0 && subscribedToUserCache.size === 0) {
      const allSubscriptions = await prisma.user.findMany({
        include: {
          userSubscribedTo: { select: { authorId: true } },
          subscribedToUser: { select: { subscriberId: true } },
        },
      });

      for (const user of allSubscriptions) {
        for (const subscription of user.subscribedToUser) {
          setToMap(subscribedToUserCache, subscription.subscriberId, user);
        }
        for (const author of user.userSubscribedTo) {
          setToMap(userSubscribedToCache, author.authorId, user);
        }
      }
    } else {
      const missingUserSubscribedToIds: string[] = [];
      const missingSubscribedToUserIds: string[] = [];

      for (const key of keys) {
        if (key.userSubscribedTo && !userSubscribedToCache.has(String(key.userSubscribedTo))) {
          missingUserSubscribedToIds.push(key.userSubscribedTo);
        }
        if (key.subscribedToUser && !subscribedToUserCache.has(String(key.subscribedToUser))) {
          missingSubscribedToUserIds.push(key.subscribedToUser);
        }
      }

      if (missingUserSubscribedToIds.length > 0) {
        const userSubscribedToData = await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: { in: missingUserSubscribedToIds },
              },
            },
          },
        });

        for (const user of userSubscribedToData) {
          for (const author of missingUserSubscribedToIds) {
            setToMap(userSubscribedToCache, author, user);
          }
        }
      }

      if (missingSubscribedToUserIds.length > 0) {
        const subscribedToUserData = await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: { in: missingSubscribedToUserIds },
              },
            },
          },
        });

        for (const user of subscribedToUserData) {
          for (const subscriber of missingSubscribedToUserIds) {
            setToMap(subscribedToUserCache, subscriber, user);
          }
        }
      }
    }
    const results: User[][] = [];

    for (const key of keys) {
      if (key.userSubscribedTo) {
        results.push(Array.from(userSubscribedToCache.get(String(key.userSubscribedTo))?.values() || []));
      } else if (key.subscribedToUser) {
        results.push(Array.from(subscribedToUserCache.get(String(key.subscribedToUser))?.values() || []));
      } else {
        results.push([]);
      }
    }

    return results;
  });
};

export const createProfileLoader = (prisma: PrismaClient) => {
  return new DataLoader<ProfileLoadArgs, Profile | null>(async (keys) => {

    const ids = keys.filter(key => key.id).map(key => key.id);
    const userIds = keys.filter(key => key.userId).map(key => key.userId);


    const profiles: Profile[] = await prisma.profile.findMany({
      where: {
        OR: [
          { id: { in: ids as string[] } },
          { userId: { in: userIds as string[] } },
        ],
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
