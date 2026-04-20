export const typeDefs = `#graphql
  enum BuildStatus {
    PENDING
    IN_PROGRESS
    TESTING
    ACCEPTED
    REJECTED
  }

  enum ComponentType {
    HEAT_SHIELD
    ENGINE_COMPONENT
    AVIONICS
    STRUCTURAL
    PROPULSION
  }

  type Component {
    id: ID!
    name: String!
    serialNumber: String!
    partNumber: String!
    type: ComponentType!
    status: BuildStatus!
    notes: String
    buildStages: [BuildStage!]!
    testEvents: [TestEvent!]!
    createdAt: String!
    updatedAt: String!
  }

  type BuildStage {
    id: ID!
    name: String!
    sequence: Int!
    completedAt: String
    notes: String
    createdAt: String!
  }

  type TestEvent {
    id: ID!
    eventType: String!
    result: String!
    performedAt: String!
    notes: String
  }

  input CreateComponentInput {
    name: String!
    serialNumber: String!
    partNumber: String!
    type: ComponentType!
    notes: String
  }

  input LogTestEventInput {
    eventType: String!
    result: String!
    notes: String
  }

  type Query {
    components(status: BuildStatus, type: ComponentType): [Component!]!
    component(id: ID!): Component
  }

  type Mutation {
    createComponent(input: CreateComponentInput!): Component!
    updateComponentStatus(id: ID!, status: BuildStatus!): Component!
    completeBuildStage(stageId: ID!, notes: String): BuildStage!
    logTestEvent(componentId: ID!, input: LogTestEventInput!): TestEvent!
  }

  type Subscription {
    componentStatusChanged: Component!
  }
`;
