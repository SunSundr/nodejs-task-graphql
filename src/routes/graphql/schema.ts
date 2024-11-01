import { buildSchema } from 'graphql';

const schemaString = `
  scalar UUID

  type User {
    id: UUID!
    posts: [Post!]!
    profile: Profile
    userSubscribedTo: [User!]!
    subscribedToUser: [User!]!
  }

  type Post {
    id: UUID!
    content: String!
    userId: UUID!
  }

  type Profile {
    id: UUID!
    userId: UUID!
    memberType: MemberType
  }

  type MemberType {
    id: UUID!
    name: String!
  }

  type Query {
    users: [User!]!
  }

  type Mutation {
    createUser(dto: CreateUserInput!): User
    createPost(dto: CreatePostInput!): Post
    createProfile(dto: CreateProfileInput!): Profile
    deleteUser(id: UUID!): Boolean
  }

  input CreateUserInput {
    name: String!
  }

  input CreatePostInput {
    content: String!
    userId: UUID!
  }

  input CreateProfileInput {
    userId: UUID!
    memberType: UUID!
  }
`;

export const schema = buildSchema(schemaString);
