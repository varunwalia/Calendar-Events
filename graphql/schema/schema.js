const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Event {
  _id: ID!
  creator: User!
  title: String!
  description: String!
  startTime: String!
  endTime: String!
  date: String!
}

type User {
  _id: ID!
  email: String!
  password: String
  createdEvents: [Event!]
}

type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
}

input EventInput {
  title: String!
  description: String!
  startTime: String!
  endTime: String!
  date: String!
}

input UserInput {
  email: String!
  password: String!
}

type RootQuery {
    events: [Event!]!
    login(email: String!, password: String!): AuthData!
}

type RootMutation {
    createEvent(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
    deleteEvent(eventId: ID!): Event
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);
