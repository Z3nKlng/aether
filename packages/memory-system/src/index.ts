import { ModelRouter } from '@aether/model-router';
import { prisma } from '@aether/database';

export interface MemoryEntry {
  id: string;
  type: 'USER' | 'TEAM' | 'AGENT';
  ownerId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class MemorySystem {
  private modelRouter: ModelRouter;

  constructor(modelRouter: ModelRouter) {
    this.modelRouter = modelRouter;
  }

  async addMemory(params: {
    type: 'USER' | 'TEAM' | 'AGENT';
    ownerId: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const embeddingResponse = await this.modelRouter.embed(params.content);
    const embeddingStr = `[${embeddingResponse.embedding.join(',')}]`;
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Memory" ("id", "type", "ownerId", "content", "metadata", "embedding", "updatedAt", "createdAt")
      VALUES (gen_random_uuid(), '${params.type}', '${params.ownerId}', $1, $2, '${embeddingStr}'::vector, NOW(), NOW())
    `, params.content, JSON.stringify(params.metadata || {}));

    console.log(`Memory added: [${params.type}] for ${params.ownerId}`);
  }

  async recall(params: {
    type: 'USER' | 'TEAM' | 'AGENT';
    ownerId: string;
    query: string;
    limit?: number;
  }): Promise<MemoryEntry[]> {
    const queryEmbedding = await this.modelRouter.embed(params.query);
    const embeddingStr = `[${queryEmbedding.embedding.join(',')}]`;

    const results: any[] = await prisma.$queryRawUnsafe(`
      SELECT "id", "type", "ownerId", "content", "metadata", "createdAt", (embedding <=> '${embeddingStr}'::vector) as distance
      FROM "Memory"
      WHERE "type" = '${params.type}' AND "ownerId" = '${params.ownerId}'
      ORDER BY distance ASC
      LIMIT ${params.limit || 5}
    `);

    return results.map(r => ({
      id: r.id,
      type: r.type,
      ownerId: r.ownerId,
      content: r.content,
      metadata: r.metadata,
      createdAt: r.createdAt,
    }));
  }
}
