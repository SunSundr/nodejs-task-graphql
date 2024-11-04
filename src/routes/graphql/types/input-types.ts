import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLFloat,
} from 'graphql';
import { MemberTypeIdEnum } from './object-types.js';
import { UUIDType } from './uuid.js';

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    userId: { type: new GraphQLNonNull(UUIDType) },
  },
});

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    //id: { type: new GraphQLNonNull(GraphQLString) }, // not used
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    // memberTypeId: { type: MemberTypeIdEnum }, // not used
    // userId: { type: UUIDType }, // not used
  },
});

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    //id: { type: new GraphQLNonNull(GraphQLString) }, // not used
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    // authorId: { type: UUIDType }, // not used
  },
});

export {
  CreateUserInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  ChangeProfileInput,
  ChangePostInput,
};
