/**
 * Workflow Engine
 *
 * Automation workflow engine: create, execute, and schedule workflows
 * with step types (trigger, action, condition, delay, notification).
 * Includes built-in workflows for lead generation, customer onboarding,
 * engagement, and reporting.
 *
 * Methods:
 *  - createWorkflow(name, steps)    — Define a new automation workflow
 *  - executeWorkflow(id)            — Execute a workflow immediately
 *  - scheduleWorkflow(id, cron)     — Schedule a workflow via cron expression
 *  - getWorkflow(id)                — Get workflow details
 *  - getExecution(id)               — Get execution details
 *  - getMetrics()                   — Returns current metrics snapshot
 */

import { EventEmitter } from 'events';
import type { AgentConfig, AgentEvent, AgentState, ActionResult, LogLevel } from '../../types';
import { Logger } from '../../logger';

// ─── Types ─────────────────────────────────────────────────────────────

export type StepType = 'trigger' | 'action' | 'condition' | 'delay' | 'notification';

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  config: Record<string, unknown>;
  dependsOn?: string[];
  timeout?: number;
  retries?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'lead_generation' | 'customer_onboarding' | 'engagement' | 'reporting' | 'internal_ops' | 'custom';
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  schedule?: { type: 'cron' | 'interval' | 'event'; value: string };
  createdAt: Date;
  lastRunAt?: Date;
  totalRuns: number;
  successRate: number;
  tags: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  startedAt: Date;
  completedAt?: Date;
  stepResults: WorkflowStepExecution[];
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  output?: Record<string, unknown>;
}

export interface WorkflowStepExecution {
  stepId: string;
  name: string;
  type: StepType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  output?: Record<string, unknown>;
}

export interface CronSchedule {
  second?: string;
  minute?: string;
  hour?: string;
  dayOfMonth?: string;
  month?: string;
  dayOfWeek?: string;
}

export interface WorkflowEngineConfig extends AgentConfig {
  maxConcurrentExecutions: number;
  executionTimeout: number;
  retryOnFailure: boolean;
  maxRetries: number;
  defaultDelay: number;
}

const DEFAULT_CONFIG: WorkflowEngineConfig = {
  name: 'workflow-engine',
  version: '2.0.0',
  enabled: true,
  interval: 10000,
  logLevel: 'info',
  maxConcurrentExecutions: 10,
  executionTimeout: 300000,
  retryOnFailure: true,
  maxRetries: 3,
  defaultDelay: 1000,
};

// ─── Error Classes ─────────────────────────────────────────────────────

export class WorkflowError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export class WorkflowNotFoundError extends WorkflowError {
  constructor(id: string) { super(`Workflow "${id}" not found`, 'WORKFLOW_NOT_FOUND'); }
}

export class ExecutionTimeoutError extends WorkflowError {
  constructor(executionId: string) { super(`Execution "${executionId}" timed out`, 'EXECUTION_TIMEOUT'); }
}

// ─── Cron Parser (simple) ──────────────────────────────────────────────

function parseCron(cron: string): CronSchedule {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) throw new WorkflowError(`Invalid cron expression: "${cron}"`, 'INVALID_CRON');
  return parts.length === 6
    ? { second: parts[0], minute: parts[1], hour: parts[2], dayOfMonth: parts[3], month: parts[4], dayOfWeek: parts[5] }
    : { minute: parts[0], hour: parts[1], dayOfMonth: parts[2], month: parts[3], dayOfWeek: parts[4] };
}

function cronMatches(schedule: CronSchedule): boolean {
  const now = new Date();
  const check = (field: string | undefined, value: number): boolean => {
    if (!field || field === '*') return true;
    if (field.includes('*/')) {
      const step = parseInt(field.split('/')[1]);
      return value % step === 0;
    }
    if (field.includes(',')) return field.split(',').map(Number).includes(value);
    return parseInt(field) === value;
  };
  return (
    check(schedule.minute, now.getMinutes()) &&
    check(schedule.hour, now.getHours()) &&
    check(schedule.dayOfMonth, now.getDate()) &&
    check(schedule.month, now.getMonth() + 1) &&
    check(schedule.dayOfWeek, now.getDay())
  );
}

// ─── Agent ─────────────────────────────────────────────────────────────

export class WorkflowEngine extends EventEmitter {
  private config: WorkflowEngineConfig;
  private state: AgentState;
  private logger: Logger;
  private workflows: Workflow[];
  private executions: WorkflowExecution[];
  private schedulers: Map<string, ReturnType<typeof setInterval>>;
  private intervalHandle: ReturnType<typeof setInterval> | null;

  constructor(config: Partial<WorkflowEngineConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger('WorkflowEngine', this.config.logLevel);
    this.state = {
      status: 'idle', lastRun: null, lastError: null, runCount: 0,
      metrics: { workflowsCreated: 0, workflowsActive: 0, executionsTotal: 0, executionsCompleted: 0, executionsFailed: 0, avgExecutionTime: 0 },
    };
    this.workflows = [];
    this.executions = [];
    this.schedulers = new Map();
    this.intervalHandle = null;
    this.logger.info('WorkflowEngine initialized');
  }

  getState(): AgentState { return { ...this.state }; }
  getConfig(): WorkflowEngineConfig { return { ...this.config }; }

  // ─── Lifecycle ───────────────────────────────────────────────────────

  start(): void {
    if (this.state.status === 'running') return;
    this.state.status = 'running';
    this.logger.info('Engine started');
    this.emit('started', { agent: this.config.name, timestamp: new Date() });

    // Schedule check every minute for cron-triggered workflows
    this.intervalHandle = setInterval(() => this.checkSchedules(), 60000);
  }

  stop(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    for (const [, handle] of this.schedulers) clearInterval(handle);
    this.schedulers.clear();
    this.intervalHandle = null;
    this.state.status = 'idle';
    this.logger.info('Engine stopped');
    this.emit('stopped', { agent: this.config.name, timestamp: new Date() });
  }

  private checkSchedules(): void {
    for (const wf of this.workflows) {
      if (wf.status === 'active' && wf.schedule?.type === 'cron') {
        try {
          const parsed = parseCron(wf.schedule.value);
          if (cronMatches(parsed)) {
            this.executeWorkflow(wf.id).catch((err) => this.logger.error('Scheduled execution failed', err));
          }
        } catch (err) {
          this.logger.warn('Invalid cron for workflow', { workflowId: wf.id, cron: wf.schedule.value });
        }
      }
    }
  }

  // ─── Create Workflow ─────────────────────────────────────────────────

  /** Create a new workflow with steps. Steps can be trigger, action, condition, delay, or notification. */
  async createWorkflow(name: string, steps: WorkflowStep[], options?: {
    description?: string;
    category?: Workflow['category'];
    schedule?: Workflow['schedule'];
    tags?: string[];
  }): Promise<ActionResult<Workflow>> {
    const start = Date.now();

    if (!steps || steps.length === 0) return { success: false, error: 'Workflow must have at least one step', duration: Date.now() - start, timestamp: new Date() };

    // Validate step types
    for (const step of steps) {
      if (!['trigger', 'action', 'condition', 'delay', 'notification'].includes(step.type)) {
        return { success: false, error: `Invalid step type "${step.type}" in step "${step.id}"`, duration: Date.now() - start, timestamp: new Date() };
      }
    }

    // Validate dependencies
    const stepIds = new Set(steps.map((s) => s.id));
    for (const step of steps) {
      if (step.dependsOn) for (const dep of step.dependsOn) {
        if (!stepIds.has(dep)) return { success: false, error: `Step "${step.name}" depends on "${dep}" which doesn't exist`, duration: Date.now() - start, timestamp: new Date() };
      }
    }

    const workflow: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description: options?.description || name,
      category: options?.category || 'custom',
      steps,
      status: 'draft',
      schedule: options?.schedule,
      createdAt: new Date(),
      totalRuns: 0,
      successRate: 100,
      tags: options?.tags || [],
    };

    this.workflows.push(workflow);
    this.state.metrics.workflowsCreated++;
    this.logger.info('Workflow created', { name, steps: steps.length });
    this.emit('workflow_created', { agent: this.config.name, workflowId: workflow.id, name, stepsCount: steps.length, timestamp: new Date() });

    return { success: true, data: workflow, duration: Date.now() - start, timestamp: new Date() };
  }

  activateWorkflow(workflowId: string): boolean {
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) return false;
    wf.status = 'active';
    this.state.metrics.workflowsActive = this.workflows.filter((w) => w.status === 'active').length;

    // Interval schedule
    if (wf.schedule?.type === 'interval') {
      const interval = parseInt(wf.schedule.value);
      if (!isNaN(interval)) {
        const handle = setInterval(() => this.executeWorkflow(workflowId), interval);
        this.schedulers.set(workflowId, handle);
      }
    }

    this.logger.info('Workflow activated', { name: wf.name });
    this.emit('workflow_activated', { agent: this.config.name, workflowId, name: wf.name, timestamp: new Date() });
    return true;
  }

  pauseWorkflow(workflowId: string): boolean {
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) return false;
    wf.status = 'paused';
    const handle = this.schedulers.get(workflowId);
    if (handle) { clearInterval(handle); this.schedulers.delete(workflowId); }
    this.state.metrics.workflowsActive = this.workflows.filter((w) => w.status === 'active').length;
    this.logger.info('Workflow paused', { name: wf.name });
    return true;
  }

  // ─── Execute Workflow ───────────────────────────────────────────────

  /** Execute a workflow immediately. */
  async executeWorkflow(workflowId: string): Promise<ActionResult<WorkflowExecution>> {
    const start = Date.now();

    const workflow = this.workflows.find((w) => w.id === workflowId);
    if (!workflow) return { success: false, error: `Workflow "${workflowId}" not found`, duration: Date.now() - start, timestamp: new Date() };

    const runningCount = this.executions.filter((e) => e.status === 'running').length;
    if (runningCount >= this.config.maxConcurrentExecutions) {
      return { success: false, error: `Max concurrent executions (${this.config.maxConcurrentExecutions}) reached`, duration: Date.now() - start, timestamp: new Date() };
    }

    // Build step executions
    const stepExecs: WorkflowStepExecution[] = workflow.steps.map((s) => ({
      stepId: s.id, name: s.name, type: s.type, status: 'pending',
    }));

    const execution: WorkflowExecution = {
      id: `exec-${workflowId}-${Date.now()}`,
      workflowId,
      startedAt: new Date(),
      stepResults: stepExecs,
      status: 'running',
    };

    this.executions.push(execution);
    this.state.metrics.executionsTotal++;

    this.logger.info('Workflow execution started', { workflowId, name: workflow.name });
    this.emit('workflow_execution_started', { agent: this.config.name, executionId: execution.id, workflowId, name: workflow.name, timestamp: new Date() });

    try {
      const executed = new Set<string>();
      let allDone = false;

      while (!allDone) {
        const pending = stepExecs.filter((s) => s.status === 'pending');
        if (pending.length === 0) { allDone = true; break; }

        // Find steps ready to execute (all dependencies met)
        const ready = pending.filter((se) => {
          const stepDef = workflow.steps.find((s) => s.id === se.stepId);
          if (!stepDef) return false;
          if (!stepDef.dependsOn || stepDef.dependsOn.length === 0) return true;
          return stepDef.dependsOn.every((dep) => executed.has(dep));
        });

        if (ready.length === 0) {
          execution.status = 'failed';
          execution.error = 'Circular dependency detected';
          this.state.metrics.executionsFailed++;
          break;
        }

        for (const se of ready) {
          se.status = 'running';
          se.startedAt = new Date();

          // Handle delay steps
          const stepDef = workflow.steps.find((s) => s.id === se.stepId);
          if (stepDef?.type === 'delay') {
            const delayMs = (stepDef.config?.duration as number) || this.config.defaultDelay;
            await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 10))); // don't actually wait
          }

          // Simulate step execution
          const stepDuration = 50 + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, 5));
          const success = Math.random() > 0.12;

          se.completedAt = new Date();
          se.duration = stepDuration;

          if (success) {
            se.status = 'completed';
            se.output = { simulated: true, stepType: se.type };
            executed.add(se.stepId);
          } else {
            se.status = 'failed';
            se.error = `Step "${se.name}" failed`;
            if (this.config.retryOnFailure) {
              for (let a = 1; a <= this.config.maxRetries; a++) {
                se.status = 'running';
                await new Promise((resolve) => setTimeout(resolve, 5));
                if (Math.random() > 0.4) { se.status = 'completed'; executed.add(se.stepId); break; }
              }
            }
            if (se.status === 'failed') {
              execution.status = 'failed';
              execution.error = `Step "${se.name}" failed after retries`;
              this.state.metrics.executionsFailed++;
              break;
            }
          }
        }

        if (execution.status === 'failed') break;

        // Check timeout
        if (Date.now() - execution.startedAt.getTime() > this.config.executionTimeout) {
          execution.status = 'failed';
          execution.error = `Execution timed out after ${this.config.executionTimeout}ms`;
          this.state.metrics.executionsFailed++;
          break;
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
        execution.completedAt = new Date();
        this.state.metrics.executionsCompleted++;
        workflow.totalRuns++;
        workflow.lastRunAt = new Date();

        const last10 = this.executions.slice(-10);
        workflow.successRate = (last10.filter((e) => e.status === 'completed').length / Math.max(last10.length, 1)) * 100;
      }

      execution.completedAt = execution.completedAt || new Date();
      const execDuration = execution.completedAt.getTime() - execution.startedAt.getTime();
      this.state.metrics.avgExecutionTime = this.state.metrics.executionsCompleted > 0
        ? (this.state.metrics.avgExecutionTime * (this.state.metrics.executionsCompleted - 1) + execDuration) / this.state.metrics.executionsCompleted
        : execDuration;

      this.logger.info('Workflow execution completed', { executionId: execution.id, status: execution.status, duration: execDuration });
      this.emit('workflow_execution_completed', { agent: this.config.name, executionId: execution.id, workflowId, status: execution.status, timestamp: new Date() });

      return { success: execution.status === 'completed', data: execution, duration: Math.max(1, execDuration), timestamp: new Date() };
    } catch (err) {
      execution.status = 'failed';
      execution.error = err instanceof Error ? err.message : String(err);
      execution.completedAt = new Date();
      this.state.metrics.executionsFailed++;
      return { success: false, error: execution.error, duration: Date.now() - start, timestamp: new Date() };
    }
  }

  // ─── Schedule Workflow ───────────────────────────────────────────────

  /** Schedule a workflow using a cron expression. */
  async scheduleWorkflow(workflowId: string, cron: string): Promise<ActionResult<Workflow>> {
    const start = Date.now();

    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) return { success: false, error: `Workflow "${workflowId}" not found`, duration: Date.now() - start, timestamp: new Date() };

    // Validate cron
    try { parseCron(cron); } catch (err) {
      return { success: false, error: `Invalid cron expression: ${err instanceof Error ? err.message : err}`, duration: Date.now() - start, timestamp: new Date() };
    }

    wf.schedule = { type: 'cron', value: cron };

    if (wf.status === 'active') {
      this.activateWorkflow(workflowId); // re-activate to pick up new schedule
    }

    this.logger.info('Workflow scheduled', { workflowId, name: wf.name, cron });
    this.emit('workflow_scheduled', { agent: this.config.name, workflowId, name: wf.name, cron, timestamp: new Date() });

    return { success: true, data: wf, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Built-in Workflows ─────────────────────────────────────────────

  /** Create a lead generation workflow. */
  async createLeadGenWorkflow(): Promise<ActionResult<Workflow>> {
    const steps: WorkflowStep[] = [
      { id: 'discover', name: 'Discover Leads from Sources', type: 'trigger', config: { source: 'market-research', action: 'discoverOpportunities' } },
      { id: 'enrich', name: 'Enrich Lead Data', type: 'action', config: { enrichment: true }, dependsOn: ['discover'] },
      { id: 'qualify', name: 'Qualify Leads', type: 'condition', config: { minScore: 60, maxLeads: 500 }, dependsOn: ['enrich'] },
      { id: 'delay', name: 'Stagger Outreach', type: 'delay', config: { duration: 300000 }, dependsOn: ['qualify'] },
      { id: 'notify', name: 'Notify Sales Team', type: 'notification', config: { channel: 'slack', template: 'lead-alert' }, dependsOn: ['delay'] },
    ];
    return this.createWorkflow('Lead Generation', steps, { description: 'Automated lead discovery, enrichment, qualification, and outreach', category: 'lead_generation', tags: ['lead-gen', 'automation'] });
  }

  /** Create a customer onboarding workflow. */
  async createCustomerOnboardingWorkflow(): Promise<ActionResult<Workflow>> {
    const steps: WorkflowStep[] = [
      { id: 'signup', name: 'User Signup Detected', type: 'trigger', config: { event: 'user.signup' } },
      { id: 'welcome', name: 'Send Welcome Email', type: 'action', config: { template: 'welcome-email' }, dependsOn: ['signup'] },
      { id: 'tutorial', name: 'Start Guided Tutorial', type: 'action', config: { tutorialId: 'getting-started' }, dependsOn: ['welcome'] },
      { id: 'check_progress', name: 'Check Tutorial Progress', type: 'condition', config: { threshold: 50, metric: 'tutorial_progress' }, dependsOn: ['tutorial'] },
      { id: 'follow_up', name: 'Send Follow-up Tips', type: 'action', config: { tipCount: 3 }, dependsOn: ['check_progress'] },
      { id: 'delay', name: 'Wait 3 Days', type: 'delay', config: { duration: 259200000 }, dependsOn: ['follow_up'] },
      { id: 'nps', name: 'Send NPS Survey', type: 'notification', config: { surveyType: 'onboarding-nps' }, dependsOn: ['delay'] },
    ];
    return this.createWorkflow('Customer Onboarding', steps, { description: 'Welcome, guide, and engage new users through their first week', category: 'customer_onboarding', tags: ['onboarding', 'customer-success'] });
  }

  /** Create an engagement workflow. */
  async createEngagementWorkflow(): Promise<ActionResult<Workflow>> {
    const steps: WorkflowStep[] = [
      { id: 'inactivity', name: 'Detect User Inactivity', type: 'trigger', config: { event: 'user.inactive', threshold: 7 } },
      { id: 'reengagement', name: 'Send Re-engagement Email', type: 'action', config: { template: 'we-miss-you' }, dependsOn: ['inactivity'] },
      { id: 'wait', name: 'Wait 3 Days', type: 'delay', config: { duration: 259200000 }, dependsOn: ['reengagement'] },
      { id: 'check', name: 'Check User Returned', type: 'condition', config: { metric: 'user_returned', expected: true }, dependsOn: ['wait'] },
      { id: 'offer', name: 'Send Special Offer', type: 'action', config: { offerType: 'premium-trial', duration: 14 }, dependsOn: ['check'] },
    ];
    return this.createWorkflow('User Re-engagement', steps, { description: 'Detect inactive users and re-engage them', category: 'engagement', tags: ['engagement', 'retention'] });
  }

  /** Create a reporting workflow. */
  async createReportingWorkflow(): Promise<ActionResult<Workflow>> {
    const steps: WorkflowStep[] = [
      { id: 'collect', name: 'Collect Metrics', type: 'action', config: { source: 'analytics-agent', metrics: ['dau', 'mau', 'mrr', 'churn'] } },
      { id: 'analyze', name: 'Analyze Trends', type: 'action', config: { window: '7d' }, dependsOn: ['collect'] },
      { id: 'generate', name: 'Generate Report', type: 'action', config: { format: 'markdown' }, dependsOn: ['analyze'] },
      { id: 'notify', name: 'Send Report to Team', type: 'notification', config: { channel: 'email', recipients: ['management@aether.dev'] }, dependsOn: ['generate'] },
    ];
    return this.createWorkflow('Weekly Report', steps, { description: 'Collect metrics, analyze trends, generate and distribute weekly report', category: 'reporting', schedule: { type: 'cron', value: '0 9 * * 1' }, tags: ['reporting', 'analytics'] });
  }

  // ─── Utility ─────────────────────────────────────────────────────────

  getWorkflow(workflowId: string): Workflow | undefined { return this.workflows.find((w) => w.id === workflowId); }
  getWorkflows(category?: Workflow['category']): Workflow[] { return category ? this.workflows.filter((w) => w.category === category) : [...this.workflows]; }
  getActiveWorkflows(): Workflow[] { return this.workflows.filter((w) => w.status === 'active'); }
  getExecution(executionId: string): WorkflowExecution | undefined { return this.executions.find((e) => e.id === executionId); }
  getRecentExecutions(limit: number = 20): WorkflowExecution[] { return this.executions.slice(-limit).reverse(); }
  getMetrics(): Record<string, number> { return { ...this.state.metrics }; }

  resetMetrics(): void {
    this.state.metrics = { workflowsCreated: 0, workflowsActive: 0, executionsTotal: 0, executionsCompleted: 0, executionsFailed: 0, avgExecutionTime: 0 };
    this.logger.info('Metrics reset');
    this.emit('metrics_reset', { agent: this.config.name, timestamp: new Date() });
  }
}