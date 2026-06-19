import OpenAI from 'openai';
import { CompletionOptions, CompletionResponse, ModelProvider } from '../types.js';

export class OpenAIProvider implements ModelProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages as any,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
      stop: options.stop,
      tools: options.tools as any,
      tool_choice: options.tool_choice as any,
    });

    return response as unknown as CompletionResponse;
  }

  async *stream(options: CompletionOptions): AsyncIterable<CompletionResponse> {
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages as any,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
      stop: options.stop,
      stream: true,
      tools: options.tools as any,
      tool_choice: options.tool_choice as any,
    });

    for await (const chunk of stream) {
      yield chunk as unknown as CompletionResponse;
    }
  }

  async embed(text: string, model: string = 'text-embedding-3-small'): Promise<any> {
    const response = await this.client.embeddings.create({
      input: text,
      model,
    });

    return {
      embedding: response.data[0].embedding,
      usage: {
        total_tokens: response.usage.total_tokens,
      },
    };
  }
}
