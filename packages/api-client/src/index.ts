import { createClient, AetherClient as Client } from './generated';

export * from './generated';

let client: Client;

export const getApiClient = (token?: string) => {
  if (!client) {
    client = createClient({
      endpoint: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
      token,
    });
  }
  return client;
};
