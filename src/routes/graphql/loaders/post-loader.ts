import { PrismaClient, Post } from '@prisma/client';
import DataLoader from 'dataloader';

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
