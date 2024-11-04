import { PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';
import { ProfileLoadArgs } from '../types/model.js';

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
