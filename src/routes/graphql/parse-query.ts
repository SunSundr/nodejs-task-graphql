import { 
  DocumentNode,
  FieldNode,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode,
  InlineFragmentNode,
  Kind, 
} from 'graphql';

export interface HasQueryKeys {
  hasUsersKey?: boolean;
  hasUserKey?: boolean;
  hasUserSubscribedToKey?: boolean;
  hasSubscribedToUserKey?: boolean;
}

export const parseQueryKeys = (parsedQuery: DocumentNode): HasQueryKeys => {
  let hasUsersKey = false;
  let hasUserKey = false;
  let hasUserSubscribedToKey = false;
  let hasSubscribedToUserKey = false;

  const visitField = (node: FieldNode) => {
    if (node.name.value === 'users') {
      hasUsersKey = true;
    } else if (node.name.value === 'user') {
      hasUserKey = true;
    }
    if (node.selectionSet) {
      for (const subNode of node.selectionSet.selections) {
        if (subNode.kind === Kind.FIELD) {
          if (subNode.name.value === 'userSubscribedTo') {
            hasUserSubscribedToKey = true;
          } else if (subNode.name.value === 'subscribedToUser') {
            hasSubscribedToUserKey = true;
          }
        }
      }
    }
  };

  const hasSelectionSet = (
    node: SelectionNode
  ): node is FieldNode | InlineFragmentNode & { selectionSet: SelectionSetNode } =>
    'selectionSet' in node && node.selectionSet !== undefined;

  const visitSelections = (selections: readonly SelectionNode[]) => {
    for (const node of selections) {
      if (node.kind === Kind.FIELD) {
        visitField(node);
      } else if (hasSelectionSet(node)) {
        visitSelections(node.selectionSet.selections);
      }
    }
  };

  const operation = parsedQuery.definitions.find(
    (def): def is OperationDefinitionNode => def.kind === Kind.OPERATION_DEFINITION
  );

  if (operation && operation.selectionSet) {
    visitSelections(operation.selectionSet.selections);
  }

  return { hasUsersKey, hasUserKey, hasUserSubscribedToKey, hasSubscribedToUserKey };
};
