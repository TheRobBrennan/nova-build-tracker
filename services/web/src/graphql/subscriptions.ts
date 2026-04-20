import { gql } from '@apollo/client';

export const COMPONENT_STATUS_CHANGED = gql`
  subscription OnComponentStatusChanged {
    componentStatusChanged {
      id
      name
      status
      updatedAt
    }
  }
`;
