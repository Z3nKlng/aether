import 'dotenv/config';
import { Orchestrator, PlannerAgent, EngineerAgent, ReviewerAgent, TesterAgent, SecurityAgent, DevOpsAgent } from '@aether/agent-runtime';
import { ModelRouter, OpenAIProvider, AnthropicProvider, GeminiProvider } from '@aether/model-router';
import { prisma } from '@aether/database';
import { redis } from '@aether/redis';
import http from 'http';

async function main() {
  const modelRouter = new ModelRouter();
  
  // Register providers
  if (process.env.OPENAI_API_KEY) {
    modelRouter.registerProvider(new OpenAIProvider(process.env.OPENAI_API_KEY));
  }
  if (process.env.ANTHROPIC_API_KEY) {
    modelRouter.registerProvider(new AnthropicProvider(process.env.ANTHROPIC_API_KEY));
  }
  if (process.env.GEMINI_API_KEY) {
    modelRouter.registerProvider(new GeminiProvider(process.env.GEMINI_API_KEY));
  }

  const orchestrator = new Orchestrator();

  // Forward orchestrator events to Redis
  orchestrator.on('task:started', async (event) => {
    await redis.publish('agent-events', JSON.stringify({ type: 'TASK_STARTED', ...event }));
  });
  orchestrator.on('task:completed', async (event) => {
    await redis.publish('agent-events', JSON.stringify({ type: 'TASK_COMPLETED', ...event }));
  });
  orchestrator.on('task:failed', async (event) => {
    await redis.publish('agent-events', JSON.stringify({ type: 'TASK_FAILED', ...event }));
  });
  orchestrator.on('task:blocked', async (event) => {
    await redis.publish('agent-events', JSON.stringify({ type: 'TASK_BLOCKED', ...event }));
  });
  orchestrator.on('task:decomposed', async (event) => {
    await redis.publish('agent-events', JSON.stringify({ type: 'TASK_DECOMPOSED', ...event }));
    
    // Create subtasks in DB
    for (const subtask of event.subtasks) {
        await prisma.task.create({
            data: {
                id: subtask.id,
                title: subtask.title,
                description: subtask.description,
                status: 'TODO',
                agentId: subtask.assignedTo,
                parentId: event.taskId,
            }
        });
    }
  });

  // Register specialized agents
  orchestrator.registerAgent(new PlannerAgent(modelRouter));
  orchestrator.registerAgent(new EngineerAgent(modelRouter));
  orchestrator.registerAgent(new ReviewerAgent(modelRouter));
  orchestrator.registerAgent(new TesterAgent(modelRouter));
  orchestrator.registerAgent(new SecurityAgent(modelRouter));
  orchestrator.registerAgent(new DevOpsAgent(modelRouter));

  // Health check server
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
    } else {
        res.writeHead(404);
        res.end();
    }
  });
  server.listen(process.env.PORT || 3001, '0.0.0.0');

  console.log(`Agent Worker started on port ${process.env.PORT || 3001}, polling for tasks...`);

  // Long-lived polling loop
  while (true) {
    try {
      // Pull tasks that are TODO and have no parent (root tasks) 
      // or are subtasks whose parents are IN_PROGRESS
      const todoTasks = await prisma.task.findMany({
        where: { 
            status: 'TODO',
            OR: [
                { parentId: null },
                { parent: { status: 'IN_PROGRESS' } }
            ]
        },
        include: { agent: true },
        orderBy: { createdAt: 'asc' },
        take: 5,
      });

      for (const dbTask of todoTasks) {
        console.log(`Processing task: ${dbTask.title}`);
        
        // Update status to IN_PROGRESS in DB
        await prisma.task.update({
          where: { id: dbTask.id },
          data: { status: 'IN_PROGRESS' },
        });

        // Map DB task to Orchestrator task
        const task = await orchestrator.createTask({
          id: dbTask.id,
          title: dbTask.title,
          description: dbTask.description || '',
          assignedTo: dbTask.agentId || 'agent-engineer',
        });

        // Run the task
        try {
          await orchestrator.runTask(task.id);
          const completedTask = orchestrator.getTask(task.id);
          
          if (completedTask?.status === 'DONE') {
              // Update status to DONE in DB
              await prisma.task.update({
                where: { id: dbTask.id },
                data: { 
                  status: 'DONE',
                  result: JSON.stringify(completedTask.result),
                },
              });
          } else if (completedTask?.status === 'FAILED') {
              await prisma.task.update({
                where: { id: dbTask.id },
                data: { status: 'FAILED' },
              });
          }
          
        } catch (err) {
          console.error(`Task ${dbTask.id} failed:`, err);
          await prisma.task.update({
            where: { id: dbTask.id },
            data: { status: 'FAILED' },
          });
        }
      }
    } catch (err) {
      console.error('Error in worker loop:', err);
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
