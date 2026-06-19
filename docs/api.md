# API Reference

Aether exposes a GraphQL API for interacting with the platform.

## Endpoint

Production: `https://api.aether-app.io/graphql`
Local: `http://localhost:4000/graphql`

## Authentication

All requests must include a Bearer token in the `Authorization` header.

```http
Authorization: Bearer <your_token>
```

## Common Queries

### Get User Profile

```graphql
query {
  me {
    id
    email
    name
    projects {
      id
      name
    }
  }
}
```

## Common Mutations

### Create Project

```graphql
mutation {
  createProject(input: { name: "My New App", description: "Built with Aether" }) {
    id
    name
  }
}
```

### Trigger Agent Task

```graphql
mutation {
  createTask(projectId: "id", prompt: "Build a login page") {
    id
    status
  }
}
```

## Real-time Updates

WebSockets are used for real-time updates on task progress and collaborative editing.

Endpoint: `wss://api.aether-app.io/ws`
