# Aether Deployment Platform

This service powers preview and production deployments for Aether projects.

## Features

- **Sandboxed Builds**: Uses the sandbox execution platform to build user projects in isolation.
- **Edge Deployment**: Simulates deployment to edge nodes (uploading to S3/CDN).
- **Custom Domains**: Assigns custom domains to successful deployments.
- **Real-time Logs**: Captures and stores build/deployment logs in the database.

## Architecture

1. **Trigger**: An API call to `POST /deploy` with a `projectId`.
2. **Initialization**: Creates a new `Deployment` record with `QUEUED` status.
3. **Sandbox Creation**: Requests a Node.js sandbox from the `SandboxManager`.
4. **Build Process**:
   - Clones the repository.
   - Runs `npm install`.
   - Runs `npm run build`.
5. **Deployment**: Uploads build artifacts to the edge network.
6. **Domain Assignment**: Updates DNS/CDN to point the domain to the new deployment.
7. **Cleanup**: Terminates the sandbox.

## API

### Start Deployment

`POST /deploy`

Payload:
```json
{
  "projectId": "uuid-of-project"
}
```

Response:
```json
{
  "message": "Deployment started",
  "deploymentId": "uuid-of-deployment"
}
```
