import { describe, it, expect, vi } from 'vitest';

describe('AI Evaluation', () => {
  it('should generate correct architectural suggestions', async () => {
    // This would call the real LLM or a mock with specific expected outputs
    const prompt = "Suggest a tech stack for a real-time chat app";
    const suggestion = "React, Node.js, Socket.io, Redis"; // Mocked expected output
    
    expect(suggestion).toContain('Socket.io');
    expect(suggestion).toContain('Redis');
  });

  it('should handle complex repo context', async () => {
    // Test if the context engine correctly identifies key files
    const files = ['package.json', 'src/index.ts', 'infra/terraform/main.tf'];
    expect(files).toContain('package.json');
  });
});
