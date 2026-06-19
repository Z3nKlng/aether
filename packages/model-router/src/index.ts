import { CompletionOptions, CompletionResponse, ModelProvider, ModelMetadata, EmbeddingResponse } from './types.js';
import { redis } from '@aether/redis';
import crypto from 'crypto';

export * from './providers/openai.js';
export * from './providers/anthropic.js';
export * from './providers/gemini.js';
export * from './types.js';

export const MODELS: ModelMetadata[] = [
  {
    id: 'gpt-4o',
    provider: 'openai',
    tier: 'premium',
    costPer1kPrompt: 0.005,
    costPer1kCompletion: 0.015,
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    tier: 'cheap',
    costPer1kPrompt: 0.00015,
    costPer1kCompletion: 0.0006,
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    provider: 'anthropic',
    tier: 'premium',
    costPer1kPrompt: 0.003,
    costPer1kCompletion: 0.015,
  },
  {
    id: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    tier: 'cheap',
    costPer1kPrompt: 0.00025,
    costPer1kCompletion: 0.00125,
  },
  {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    tier: 'premium',
    costPer1kPrompt: 0.0035,
    costPer1kCompletion: 0.0105,
  },
  {
    id: 'gemini-1.5-flash',
    provider: 'gemini',
    tier: 'cheap',
    costPer1kPrompt: 0.00035,
    costPer1kCompletion: 0.00105,
  },
];

export class ModelRouter {
  private providers: Map<string, ModelProvider> = new Map();

  registerProvider(provider: ModelProvider) {
    this.providers.set(provider.name, provider);
  }

  private async getCache(options: CompletionOptions): Promise<CompletionResponse | null> {
    const modelMetadata = MODELS.find(m => m.id === options.model);
    if (modelMetadata?.tier === 'premium') return null; // Only cache cheap models

    const hash = crypto.createHash('sha256').update(JSON.stringify(options)).digest('hex');
    const cached = await redis.get(`prompt-cache:${hash}`);
    if (cached) {
      console.log(`Cache hit for ${options.model}`);
      return JSON.parse(cached);
    }
    return null;
  }

  private async setCache(options: CompletionOptions, response: CompletionResponse) {
    const modelMetadata = MODELS.find(m => m.id === options.model);
    if (modelMetadata?.tier === 'premium') return;

    const hash = crypto.createHash('sha256').update(JSON.stringify(options)).digest('hex');
    
    // TTL based on response type (code: 5min, chat: 1min, analysis: 30min)
    let ttl = 60; // default 1min
    if (options.type === 'code') ttl = 300;
    if (options.type === 'analysis') ttl = 1800;

    await redis.set(`prompt-cache:${hash}`, JSON.stringify(response), 'EX', ttl);
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const startTime = Date.now();
    
    // Intelligent routing: route simple tasks to cheap models
    const requestedModel = options.model === 'auto' ? this.detectModel(options) : options.model;
    const modelMetadata = this.resolveModel(requestedModel, options.messages);
    
    // Check cache if not streaming
    if (!options.stream) {
      const cached = await this.getCache({ ...options, model: modelMetadata.id });
      if (cached) return cached;
    }
    
    // Fallback logic
    const providersToTry = this.getProvidersForModel(modelMetadata.id);
    
    let lastError: Error | null = null;
    for (const provider of providersToTry) {
      try {
        const response = await provider.complete({
          ...options,
          model: modelMetadata.id,
        });
        
        this.enrichResponse(response, modelMetadata, startTime);
        
        if (!options.stream) {
          await this.setCache({ ...options, model: modelMetadata.id }, response);
        }
        
        return response;
      } catch (err) {
        console.error(`Provider ${provider.name} failed for model ${modelMetadata.id}:`, err);
        lastError = err as Error;
      }
    }

    // Automatic fallback: if premium model fails, retry with cheap model
    if (modelMetadata.tier === 'premium') {
        console.log(`Premium model ${modelMetadata.id} failed, falling back to cheap tier...`);
        const cheapModel = MODELS.find(m => m.tier === 'cheap' && m.provider === modelMetadata.provider) || MODELS.find(m => m.tier === 'cheap')!;
        return this.complete({ ...options, model: cheapModel.id });
    }

    throw new Error(`All providers failed for model ${modelMetadata.id}. Last error: ${lastError?.message}`);
  }

  private detectModel(options: CompletionOptions): string {
    const totalChars = options.messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    // Heuristic: if context is > 10k chars or type is analysis/code, use premium
    if (totalChars > 10000 || options.type === 'analysis' || options.type === 'code') {
        return 'gpt-4o';
    }
    return 'gpt-4o-mini';
  }

  async *stream(options: CompletionOptions): AsyncIterable<CompletionResponse> {
    const requestedModel = options.model === 'auto' ? this.detectModel(options) : options.model;
    const modelMetadata = this.resolveModel(requestedModel, options.messages);
    const provider = this.getProvidersForModel(modelMetadata.id)[0];
    
    if (!provider) {
        throw new Error(`No provider found for model: ${modelMetadata.id}`);
    }

    // Streaming Middleware: log or transform chunks
    for await (const chunk of provider.stream({
      ...options,
      model: modelMetadata.id,
    })) {
      if (options.requestId) {
        await redis.publish(`stream:${options.requestId}`, JSON.stringify(chunk));
      }
      yield chunk;
    }
  }

  async embed(text: string, model: string = 'text-embedding-3-small'): Promise<EmbeddingResponse> {
    const provider = this.getProvidersForModel(model)[0];
    if (!provider) {
      throw new Error(`No provider found for model: ${model}`);
    }
    return provider.embed(text, model);
  }

  private resolveModel(requestedModel: string, _messages: any[]): ModelMetadata {
    const metadata = MODELS.find(m => m.id === requestedModel);
    if (!metadata) {
      // Default fallback
      return MODELS[0];
    }
    return metadata;
  }

  private getProvidersForModel(modelId: string): ModelProvider[] {
    const metadata = MODELS.find(m => m.id === modelId);
    if (!metadata) {
      // If it's a known provider-specific model string not in our list
      if (modelId.startsWith('gpt-')) return [this.providers.get('openai')!].filter(Boolean);
      return Array.from(this.providers.values());
    }
    
    const primary = this.providers.get(metadata.provider);
    if (!primary) return Array.from(this.providers.values());

    // Simple fallback: primary first, then others
    return [primary, ...Array.from(this.providers.values()).filter(p => p !== primary)];
  }

  private enrichResponse(response: CompletionResponse, metadata: ModelMetadata, startTime: number) {
    const latency = Date.now() - startTime;
    const promptTokens = response.usage?.prompt_tokens || 0;
    const completionTokens = response.usage?.completion_tokens || 0;
    
    const cost = (promptTokens / 1000) * metadata.costPer1kPrompt + 
                 (completionTokens / 1000) * metadata.costPer1kCompletion;

    if (!response.usage) {
      response.usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    }
    
    (response.usage as any).cost = cost;
    (response.usage as any).latency = latency;
  }
}
