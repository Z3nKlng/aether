import { ModelRouter, Message, CompletionOptions } from '@aether/model-router';
import { v4 as uuidv4 } from 'uuid';

export interface AgentContext {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'blocked';
  result?: any;
  dependencies?: string[];
  subtasks?: string[];
  parentTask?: string;
  assignedTo?: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute(args: any): Promise<any>;
}

export abstract class Agent {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  protected systemPrompt: string;
  protected modelRouter: ModelRouter;
  protected tools: Map<string, Tool> = new Map();

  constructor(context: AgentContext, modelRouter: ModelRouter) {
    this.id = context.id || uuidv4();
    this.name = context.name;
    this.role = context.role;
    this.systemPrompt = context.systemPrompt;
    this.modelRouter = modelRouter;
  }

  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  abstract run(task: AgentTask): Promise<void>;
  
  protected async chat(messages: Message[], options: Partial<CompletionOptions> = {}): Promise<string> {
    let currentMessages = [
      { role: 'system', content: this.systemPrompt },
      ...messages
    ] as Message[];

    const tools = Array.from(this.tools.values()).map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }
    }));

    while (true) {
      const response = await this.modelRouter.complete({
        model: options.model || 'gpt-4o',
        messages: currentMessages,
        tools: tools.length > 0 ? tools : undefined,
        ...options
      });

      const message = response.choices[0].message;
      currentMessages.push(message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const result = await this.callTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      return message.content || '';
    }
  }

  protected async callTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    console.log(`Agent ${this.name} calling tool ${name} with args:`, args);
    return tool.execute(args);
  }
}
