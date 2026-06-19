import { Server } from "@hocuspocus/server";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { prisma } from "@aether/database";
import { redis } from "@aether/redis";

export const collaborationServer = Server.configure({
  port: 1234, // We can run it on a separate port or integrate with Fastify
  async onAuthenticate(data) {
    const { token } = data;
    
    // In a real app, verify the JWT token
    if (!token) {
      throw new Error("Not authenticated");
    }

    return {
      user: {
        id: "user-id", // Extract from token
        name: "User Name",
      },
    };
  },

  async onLoadDocument(data) {
    // Load from database if needed
    return null;
  },

  async onStoreDocument(data) {
    // Save to database
  },
});
