import { PrismaClient, MemberType } from '@prisma/client';
import DataLoader from 'dataloader';

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
