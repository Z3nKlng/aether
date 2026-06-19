import { CompletionOptions, CompletionResponse, ModelProvider, EmbeddingResponse } from '../types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements ModelProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const model = this.genAI.getGenerativeModel({ model: options.model });
    
    const contents = options.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.max_tokens,
      },
    });

    const response = await result.response;
    const text = response.text();

    return {
      id: Math.random().toString(36).substring(7),
      object: 'chat.completion',
      created: Date.now(),
      model: options.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: text },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
        completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: response.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async *stream(options: CompletionOptions): AsyncIterable<CompletionResponse> {
    const model = this.genAI.getGenerativeModel({ model: options.model });
    
    const contents = options.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const result = await model.generateContentStream({
      contents,
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.max_tokens,
      },
    });

    for await (const chunk of result.stream) {
      yield {
        id: Math.random().toString(36).substring(7),
        object: 'chat.completion',
        created: Date.now(),
        model: options.model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: chunk.text() },
          finish_reason: 'stop',
        }],
      };
    }
  }

  async embed(text: string, model: string): Promise<EmbeddingResponse> {
    const embeddingModel = this.genAI.getGenerativeModel({ model });
    const result = await embeddingModel.embedContent(text);
    return {
      embedding: Array.from(result.embedding.values),
    };
  }
}
