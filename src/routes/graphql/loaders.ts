import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { User, Post, MemberType } from '@prisma/client';

export type Loaders = {
  userLoader: DataLoader<string, User | null>;
  postLoader: DataLoader<string, Post[]>;
  memberTypeLoader: DataLoader<string, MemberType[]>;
};

const prisma = new PrismaClient();

// User
export const createUserLoader = () => new DataLoader(async (userIds: readonly string[]) => {
  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
  });
  const userMap = new Map<string, User>(users.map(user => [user.id, user]));
  return userIds.map(id => userMap.get(id) || null);
});

// Posts
export const createPostLoader = () => new DataLoader(async (authorIds: readonly string[]) => {
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
export const createMemberTypeLoader = () => new DataLoader(async (memberTypeIds: readonly string[]) => {
  const memberTypes = await prisma.memberType.findMany({
    where: { id: { in: Array.from(memberTypeIds) } },
  });
  // console.log(memberTypes); // OK !!!
  // [
  //   { id: 'BASIC', discount: 2.3, postsLimitPerMonth: 10 },
  //   { id: 'BUSINESS', discount: 7.7, postsLimitPerMonth: 100 }
  // ]
  const memberTypeMap = new Map<string, MemberType>(memberTypes.map(type => [type.id, type]));
  return memberTypeIds.map(id => memberTypeMap.get(id) || null);
});
