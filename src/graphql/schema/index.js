const graphql = require('graphql');

module.exports = graphql.buildSchema(`
  schema {
    query: RootQuery
    mutation: RootMutation
  }

  type RootQuery {
    task(id: ID!): Task!
    tasks(excludeCompleted: Boolean!): [Task!]!
  }

  type RootMutation {
    createTask(summary: String!): Task!
    updateTask(id: ID!, taskUpdate: TaskUpdateData!): Task!
    deleteTask(id: ID!): Boolean
  }

  type Task {
    _id: ID!
    summary: String!
    isCompleted: Boolean
    createdAt: String!
    updatedAt: String!
  }

  input TaskUpdateData {
    summary: String!
    isCompleted: Boolean!
  }
`);
