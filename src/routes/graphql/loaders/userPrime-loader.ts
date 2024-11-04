import { PrismaClient, User } from '@prisma/client';
import DataLoader from 'dataloader';
import { UserLoadArgs } from '../types/model.js';
import { HasQueryKeys } from '../parse-query.js';

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
