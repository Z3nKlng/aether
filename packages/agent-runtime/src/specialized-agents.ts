import { BaseAgent } from './base-agent.js';
import { AgentTask } from './agent.js';
import { ModelRouter } from '@aether/model-router';
import { ShellTool, FileReadTool, FileWriteTool } from './tools/sandbox.js';
import { GitTool } from './tools/git.js';

export class PlannerAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-planner',
      name: 'Planner',
      role: 'System Architect & Planner',
      systemPrompt: 'You are the Aether Planner. Your job is to take a high-level goal and decompose it into a sequence of actionable technical tasks with dependencies. Be precise and consider edge cases. ALWAYS return a JSON array of tasks if requested.',
    }, modelRouter);
  }
}


export class EngineerAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-engineer',
      name: 'Engineer',
      role: 'Full-Stack Software Engineer',
      systemPrompt: 'You are the Aether Engineer. You write high-quality, performant, and clean code. You follow best practices and design patterns. You are an expert in TypeScript, React, Node.js, and modern web technologies.',
    }, modelRouter);
    this.registerTool(new ShellTool());
    this.registerTool(new FileReadTool());
    this.registerTool(new FileWriteTool());
  }
}

export class ReviewerAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-reviewer',
      name: 'Reviewer',
      role: 'Code Reviewer & Quality Analyst',
      systemPrompt: 'You are the Aether Reviewer. Your job is to review code for bugs, security vulnerabilities, and adherence to style guides. Provide constructive feedback and ensure high code quality.',
    }, modelRouter);
    this.registerTool(new FileReadTool());
  }
}

export class TesterAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-tester',
      name: 'Tester',
      role: 'QA Automation Engineer',
      systemPrompt: 'You are the Aether Tester. You write unit, integration, and e2e tests. You ensure that the software works as expected and handle edge cases. You use Vitest, Playwright, and other testing tools.',
    }, modelRouter);
    this.registerTool(new ShellTool());
    this.registerTool(new FileReadTool());
    this.registerTool(new FileWriteTool());
  }
}

export class SecurityAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-security',
      name: 'Security Analyst',
      role: 'Cybersecurity Expert',
      systemPrompt: 'You are the Aether Security Agent. You audit code for security flaws (OWASP Top 10), manage secrets, and ensure that the infrastructure is hardened. You prioritize safety and data protection.',
    }, modelRouter);
    this.registerTool(new ShellTool());
    this.registerTool(new FileReadTool());
  }
}

export class DevOpsAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-devops',
      name: 'DevOps',
      role: 'Cloud Infrastructure Engineer',
      systemPrompt: 'You are the Aether DevOps Agent. You manage CI/CD pipelines, Docker containers, Kubernetes clusters, and cloud infrastructure (AWS/GCP). You optimize for reliability, scalability, and deployment speed.',
    }, modelRouter);
    this.registerTool(new ShellTool());
    this.registerTool(new FileReadTool());
    this.registerTool(new FileWriteTool());
  }
}

export class GitAgent extends BaseAgent {
  constructor(modelRouter: ModelRouter, id?: string) {
    super({
      id: id || 'agent-git',
      name: 'Git',
      role: 'Git & Repository Manager',
      systemPrompt: 'You are the Aether Git Agent. You manage git operations, handle pull requests, manage branches, and ensure repository health. You are an expert in Git, GitHub, GitLab, and Bitbucket APIs.',
    }, modelRouter);
    this.registerTool(new ShellTool());
    this.registerTool(new FileReadTool());
    if (process.env.GITHUB_TOKEN) {
      this.registerTool(new GitTool(process.env.GITHUB_TOKEN));
    }
  }
}
