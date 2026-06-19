import { Agent, AgentTask } from './agent.js';
import { ModelRouter } from '@aether/model-router';

export class BaseAgent extends Agent {
  async run(task: AgentTask): Promise<void> {
    console.log(`Agent ${this.name} starting task: ${task.title}`);
    
    const result = await this.chat([
      { role: 'user', content: `Task: ${task.title}\nDescription: ${task.description}\n\nPlease complete this task.` }
    ]);

    task.result = result;
    console.log(`Agent ${this.name} completed task: ${task.title}`);
  }
}
