import { User, Post, Profile } from '@prisma/client';

export type UUID = string;

// export interface CreateUserInput {
//   name: string;
// }

// export interface CreatePostInput {
//   content: string;
//   userId: string;
// }

// export interface CreateProfileInput {
//   userId: string;
//   memberType: string;
// }


export interface CreateUserDto {
  name: string;
  balance: number;
  id: string;
}

export interface CreatePostDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface CreateProfileDto {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
}

export interface MutationResolvers {
  createUser: (_: unknown, args: { dto: CreateUserDto }) => Promise<User>;
  createPost: (_: unknown, args: { dto: CreatePostDto }) => Promise<Post>;
  createProfile: (_: unknown, args: { dto: CreateProfileDto }) => Promise<Profile>;
  deleteUser: (_: unknown, args: { id: UUID }) => Promise<boolean>;
}

export interface QueryResolvers {
  users: () => Promise<User[]>;
}