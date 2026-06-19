import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { ModelRouter } from '@aether/model-router';
import { prisma } from '@aether/database';

export interface FileContext {
  path: string;
  content: string;
  embedding?: number[];
  tokens?: number;
}

export class ContextEngine {
  private rootDir: string;
  private projectId: string;
  private modelRouter: ModelRouter;

  constructor(rootDir: string, projectId: string, modelRouter: ModelRouter) {
    this.rootDir = rootDir;
    this.projectId = projectId;
    this.modelRouter = modelRouter;
  }

  async buildIndex(): Promise<void> {
    const files = await glob('**/*.{ts,tsx,js,jsx,md,json,py,go}', {
      cwd: this.rootDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**'],
    });

    console.log(`Indexing ${files.length} files for project ${this.projectId}...`);

    for (const file of files) {
      const filePath = path.join(this.rootDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Truncate for embedding
        const response = await this.modelRouter.embed(content.slice(0, 8000));
        
        // Store in DB using raw SQL for the vector field
        const embeddingStr = `[${response.embedding.join(',')}]`;
        
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Context" ("id", "projectId", "filePath", "content", "embedding", "updatedAt")
          VALUES (gen_random_uuid(), '${this.projectId}', '${file}', $1, '${embeddingStr}'::vector, NOW())
          ON CONFLICT ("projectId", "filePath") 
          DO UPDATE SET "content" = $1, "embedding" = '${embeddingStr}'::vector, "updatedAt" = NOW()
        `, content);

      } catch (err) {
        console.warn(`Failed to index ${file}:`, err);
      }
    }
  }

  async search(query: string, limit: number = 5): Promise<FileContext[]> {
    const queryEmbedding = await this.modelRouter.embed(query);
    const embeddingStr = `[${queryEmbedding.embedding.join(',')}]`;

    // Semantic search using pgvector <-> operator
    const results: any[] = await prisma.$queryRawUnsafe(`
      SELECT "filePath" as path, "content", (embedding <=> '${embeddingStr}'::vector) as distance
      FROM "Context"
      WHERE "projectId" = '${this.projectId}'
      ORDER BY distance ASC
      LIMIT ${limit}
    `);

    return results.map(r => ({
      path: r.path,
      content: r.content,
    }));
  }

  compressContext(contexts: FileContext[], maxTokens: number = 2000): string {
    let result = '';
    let currentTokens = 0;
    
    for (const ctx of contexts) {
      const snippet = `File: ${ctx.path}\nContent:\n${ctx.content.slice(0, 1000)}\n---\n`;
      if (currentTokens + snippet.length / 4 > maxTokens) break;
      result += snippet;
      currentTokens += snippet.length / 4;
    }
    
    return result;
  }
}
