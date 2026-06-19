import { EventEmitter } from 'events';
import { Agent, AgentTask } from './agent.js';
import { v4 as uuidv4 } from 'uuid';

export interface OrchestrationEvent {
  taskId: string;
  agentId?: string;
  status: string;
  payload?: any;
}

export class Orchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();

  registerAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
    console.log(`Registered agent: ${agent.name} (${agent.role})`);
  }

  async createTask(params: Partial<AgentTask>): Promise<AgentTask> {
    const task: AgentTask = {
      id: uuidv4(),
      title: params.title || 'Untitled Task',
      description: params.description || '',
      status: 'pending',
      dependencies: params.dependencies || [],
      subtasks: [],
      parentTask: params.parentTask,
      assignedTo: params.assignedTo,
    };
    this.tasks.set(task.id, task);
    this.emit('task:created', { taskId: task.id, status: task.status });
    return task;
  }

  async runTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    if (task.status === 'completed' || task.status === 'in-progress') return;

    // Check dependencies
    for (const depId of task.dependencies || []) {
      const dep = this.tasks.get(depId);
      if (!dep || dep.status !== 'completed') {
        task.status = 'blocked';
        this.emit('task:blocked', { taskId, payload: { waitingOn: depId } });
        return;
      }
    }

    // If has subtasks, wait for them
    if (task.subtasks && task.subtasks.length > 0) {
      task.status = 'in-progress';
      for (const stId of task.subtasks) {
        await this.runTask(stId);
      }
      
      // Check if all subtasks are done
      const allDone = task.subtasks.every(stId => this.tasks.get(stId)?.status === 'completed');
      if (allDone) {
        task.status = 'completed';
        this.emit('task:completed', { taskId });
        // Trigger potential blocked tasks
        await this.checkBlockedTasks();
      }
      return;
    }

    // Execute task with assigned agent
    if (task.assignedTo) {
      const agent = this.agents.get(task.assignedTo);
      if (!agent) throw new Error(`Agent ${task.assignedTo} not found`);

      task.status = 'in-progress';
      this.emit('task:started', { taskId, agentId: agent.id });

      try {
        await agent.run(task);
        
        // If it was the planner, decompose the task based on its result
        if (agent.role === 'System Architect & Planner' && task.result) {
          try {
            let jsonStr = task.result;
            if (jsonStr.includes('```json')) {
              jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
            } else if (jsonStr.includes('```')) {
              jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
            }
            const decomposition = JSON.parse(jsonStr);
            if (Array.isArray(decomposition)) {
              await this.decomposeTask(task.id, decomposition);
              // After decomposition, the task is not "completed" yet, it's "in-progress" waiting for subtasks
              task.status = 'in-progress';
              this.emit('task:decomposed', { taskId: task.id, subtasks: task.subtasks });
              
              // Run the first subtasks
              for (const stId of task.subtasks || []) {
                await this.runTask(stId);
              }
              return; // Don't mark parent as completed yet
            }
          } catch (e) {
            console.error('Failed to parse planner decomposition:', e);
          }
        }

        task.status = 'completed';
        this.emit('task:completed', { taskId, agentId: agent.id });
        await this.checkBlockedTasks();
      } catch (error) {
        task.status = 'failed';
        this.emit('task:failed', { taskId, agentId: agent.id, payload: { error } });
        throw error;
      }
    } else {
        // No agent assigned, maybe it's a structural task that just needs subtasks
        if (!task.subtasks || task.subtasks.length === 0) {
            console.warn(`Task ${taskId} has no agent and no subtasks.`);
        }
    }
  }

  private async checkBlockedTasks() {
    for (const task of this.tasks.values()) {
      if (task.status === 'blocked' || task.status === 'pending') {
        const canRun = (task.dependencies || []).every(depId => this.tasks.get(depId)?.status === 'completed');
        if (canRun) {
          await this.runTask(task.id);
        }
      }
    }
  }

  async decomposeTask(taskId: string, decomposition: Array<Partial<AgentTask>>): Promise<string[]> {
    const parentTask = this.tasks.get(taskId);
    if (!parentTask) throw new Error('Parent task not found');

    const subtaskIds: string[] = [];
    for (const params of decomposition) {
      const subtask = await this.createTask({
        ...params,
        parentTask: taskId,
      });
      subtaskIds.push(subtask.id);
    }
    parentTask.subtasks = subtaskIds;
    return subtaskIds;
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }
}
