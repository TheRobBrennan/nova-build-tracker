import { gql } from '@apollo/client';

export const CREATE_COMPONENT = gql`
  mutation CreateComponent($input: CreateComponentInput!) {
    createComponent(input: $input) {
      id
      name
      serialNumber
      partNumber
      type
      status
      notes
      buildStages {
        id
        name
        sequence
        completedAt
      }
      testEvents {
        id
        eventType
        result
        performedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMPONENT_STATUS = gql`
  mutation UpdateComponentStatus($id: ID!, $status: BuildStatus!) {
    updateComponentStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const COMPLETE_BUILD_STAGE = gql`
  mutation CompleteBuildStage($stageId: ID!, $notes: String) {
    completeBuildStage(stageId: $stageId, notes: $notes) {
      id
      completedAt
      notes
    }
  }
`;

export const LOG_TEST_EVENT = gql`
  mutation LogTestEvent($componentId: ID!, $input: LogTestEventInput!) {
    logTestEvent(componentId: $componentId, input: $input) {
      id
      eventType
      result
      performedAt
      notes
    }
  }
`;
