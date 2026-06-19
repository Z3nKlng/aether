import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelRouter } from './index';
import { ModelProvider, CompletionOptions } from './types';

const mockProvider: ModelProvider = {
  name: 'openai',
  complete: vi.fn(),
  stream: vi.fn(),
  embed: vi.fn(),
};

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => {
    router = new ModelRouter();
    router.registerProvider(mockProvider);
    vi.clearAllMocks();
  });

  it('should register a provider', () => {
    expect(router['providers'].has('openai')).toBe(true);
  });

  it('should resolve "auto" model to premium for long context', async () => {
    const options: CompletionOptions = {
      model: 'auto',
      messages: [{ role: 'user', content: 'a'.repeat(10001) }],
    };

    mockProvider.complete.mockResolvedValue({
      id: 'test',
      choices: [{ message: { content: 'test response', role: 'assistant' }, index: 0, finish_reason: 'stop' }],
    });

    await router.complete(options);

    expect(mockProvider.complete).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-4o',
    }));
  });

  it('should resolve "auto" model to cheap for short context', async () => {
    const options: CompletionOptions = {
      model: 'auto',
      messages: [{ role: 'user', content: 'short' }],
    };

    mockProvider.complete.mockResolvedValue({
      id: 'test',
      choices: [{ message: { content: 'test response', role: 'assistant' }, index: 0, finish_reason: 'stop' }],
    });

    await router.complete(options);

    expect(mockProvider.complete).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-4o-mini',
    }));
  });

  it('should fallback to other providers if one fails', async () => {
    const mockProvider2: ModelProvider = {
      name: 'anthropic',
      complete: vi.fn(),
      stream: vi.fn(),
      embed: vi.fn(),
    };
    router.registerProvider(mockProvider2);

    mockProvider.complete.mockRejectedValue(new Error('OpenAI failed'));
    mockProvider2.complete.mockResolvedValue({
      id: 'test',
      choices: [{ message: { content: 'Anthropic response', role: 'assistant' }, index: 0, finish_reason: 'stop' }],
    });

    const response = await router.complete({ model: 'gpt-4o', messages: [] });

    expect(mockProvider.complete).toHaveBeenCalled();
    expect(mockProvider2.complete).toHaveBeenCalled();
    expect(response.choices[0].message.content).toBe('Anthropic response');
  });
});
