import { CompletionOptions, CompletionResponse, ModelProvider, EmbeddingResponse } from '../types.js';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider implements ModelProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const response = await this.client.messages.create({
      model: options.model,
      messages: options.messages as any,
      max_tokens: options.max_tokens || 4096,
      temperature: options.temperature,
      tools: options.tools,
    });

    return {
      id: response.id,
      object: 'chat.completion',
      created: Date.now(),
      model: options.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.content[0].type === 'text' ? response.content[0].text : '',
          },
          finish_reason: response.stop_reason || 'stop',
        },
      ],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async *stream(options: CompletionOptions): AsyncIterable<CompletionResponse> {
    const stream = await this.client.messages.create({
      model: options.model,
      messages: options.messages as any,
      max_tokens: options.max_tokens || 4096,
      temperature: options.temperature,
      stream: true,
      tools: options.tools,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield {
          id: '',
          object: 'chat.completion',
          created: Date.now(),
          model: options.model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: chunk.delta.text,
              },
              finish_reason: '',
            },
          ],
        } as CompletionResponse;
      }
    }
  }

  async embed(_text: string, _model: string): Promise<EmbeddingResponse> {
    throw new Error('Anthropic does not support embeddings yet.');
  }
}
