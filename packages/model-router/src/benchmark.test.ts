import { describe, it, expect, beforeAll } from 'vitest';
import { ModelRouter } from './index';

describe('Model Router Benchmarks', () => {
  let router: ModelRouter;

  beforeAll(() => {
    router = new ModelRouter();
  });

  it('should route to the fastest available model for simple tasks', async () => {
    const start = Date.now();
    const response = await router.route({
      prompt: 'What is 2+2?',
      maxTokens: 10,
      priority: 'latency'
    });
    const duration = Date.now() - start;

    console.log(`Latency-priority routing took ${duration}ms`);
    expect(response.text).toContain('4');
    // Expect latency-priority to be fast (e.g., < 1000ms for small prompt)
    expect(duration).toBeLessThan(2000);
  });

  it('should route to a powerful model for complex tasks', async () => {
    const start = Date.now();
    const response = await router.route({
      prompt: 'Explain the difference between quantum entanglement and superposition in detail.',
      maxTokens: 100,
      priority: 'quality'
    });
    const duration = Date.now() - start;

    console.log(`Quality-priority routing took ${duration}ms`);
    expect(response.model).toMatch(/gpt-4|claude-3/);
  });
});
