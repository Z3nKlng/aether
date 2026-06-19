import { z } from 'zod';

export const MessageRoleSchema = z.enum(['system', 'user', 'assistant', 'tool']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().nullable(),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
  tool_calls: z.array(z.object({
    id: z.string(),
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  })).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export type CompletionType = 'code' | 'chat' | 'analysis';

export const CompletionOptionsSchema = z.object({
  model: z.string(),
  messages: z.array(MessageSchema),
  temperature: z.number().optional().default(0.7),
  max_tokens: z.number().optional(),
  top_p: z.number().optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  stream: z.boolean().optional().default(false),
  requestId: z.string().optional(),
  tools: z.array(z.any()).optional(),
  tool_choice: z.any().optional(),
  type: z.enum(['code', 'chat', 'analysis']).optional(),
});
export type CompletionOptions = z.infer<typeof CompletionOptionsSchema>;

export interface CompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
    latency?: number;
  };
}

export interface ModelMetadata {
  id: string;
  provider: string;
  tier: 'cheap' | 'premium';
  costPer1kPrompt: number;
  costPer1kCompletion: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  usage?: {
    total_tokens: number;
  };
}

export interface ModelProvider {
  name: string;
  complete(options: CompletionOptions): Promise<CompletionResponse>;
  stream(options: CompletionOptions): AsyncIterable<CompletionResponse>;
  embed(text: string, model?: string): Promise<EmbeddingResponse>;
}
