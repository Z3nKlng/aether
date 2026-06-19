# Aether SDK Documentation

The Aether SDK allows developers to integrate Aether's autonomous capabilities into their own workflows.

## Installation

```bash
npm install @aether/sdk
```

## Usage

### Initialize the SDK

```typescript
import { Aether } from '@aether/sdk';

const aether = new Aether({
  apiKey: process.env.AETHER_API_KEY
});
```

### Run an Autonomous Task

```typescript
const result = await aether.run({
  prompt: "Add a dark mode toggle to the dashboard",
  repo: "owner/repo"
});

console.log(`Task completed: ${result.url}`);
```

### Listen for Events

```typescript
aether.on('task:progress', (event) => {
  console.log(`[${event.agent}] ${event.message}`);
});
```

## Advanced Configuration

- **Sandbox Options:** Configure CPU/Memory for the execution environment.
- **Agent Selection:** Specify which agent specializations to use.
- **Model Routing:** Choose preferred LLM providers.
