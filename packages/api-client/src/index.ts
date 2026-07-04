import { createClient, AetherClient as Client } from './generated';

export * from './generated';

let client: Client;

export const getApiClient = (token?: string) => {
  if (!client) {
    client = createClient({
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
      headers: () => {
        if (token) {
          return {
            Authorization: `Bearer ${token}`,
          };
        }
        return {};
      },
    });
  }
  return client;
};
