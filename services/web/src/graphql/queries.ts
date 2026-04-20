import { gql } from '@apollo/client';

export const COMPONENT_FIELDS = gql`
  fragment ComponentFields on Component {
    id
    name
    serialNumber
    partNumber
    type
    status
    notes
    updatedAt
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
  }
`;

export const GET_COMPONENTS = gql`
  ${COMPONENT_FIELDS}
  query GetComponents($status: BuildStatus, $type: ComponentType) {
    components(status: $status, type: $type) {
      ...ComponentFields
    }
  }
`;

export const GET_COMPONENT = gql`
  ${COMPONENT_FIELDS}
  query GetComponent($id: ID!) {
    component(id: $id) {
      ...ComponentFields
    }
  }
`;
