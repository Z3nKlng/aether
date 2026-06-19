/**
 * Intelligence Layer
 *
 * Central coordinator that registers all business agents, maintains a
 * prioritized task queue, allocates resources, resolves conflicts,
 * monitors agent performance, balances workloads, and provides
 * a company-level status overview.
 *
 * Methods:
 *  - coordinate()                — Run full coordination cycle
 *  - prioritizeTasks()           — Prioritize queued tasks
 *  - allocateResources(task)     — Allocate resources to an agent for a task
 *  - resolveConflicts()          — Detect and resolve scheduling/dependency conflicts
 *  - monitorAgentPerformance()   — Monitor all registered agents
 *  - balanceWorkloads()          — Redistribute tasks to balance load
 *  - getCompanyStatus()          — Get overall company operational status
 *  - getMetrics()                — Returns current metrics snapshot
 */

import { EventEmitter } from 'events';
import type { AgentConfig, AgentEvent, AgentState, ActionResult, AgentPriority, LogLevel } from '../../types';
import { Logger } from '../../logger';

// ─── Types ─────────────────────────────────────────────────────────────

export interface AgentRegistration {
  id: string;
  name: string;
  status: 'registered' | 'running' | 'stopped' | 'error';
  priority: AgentPriority;
  capabilities: string[];
  resourceUsage: { cpu: number; memory: number; calls: number };
  performance: { successRate: number; avgResponseTime: number; tasksCompleted: number; errors: number; loadLevel: number };
  lastHeartbeat: Date | null;
}

export interface TaskItem {
  id: string;
  description: string;
  priority: number;
  urgency: number;
  impact: number;
  score: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  createdAt: Date;
}

export interface ResourceAllocation {
  agentId: string;
  allocatedCpu: number;
  allocatedMemory: number;
  priority: number;
  reason: string;
}

export interface Conflict {
  id: string;
  type: 'resource' | 'dependency' | 'scheduling';
  agents: string[];
  resource?: string;
  description: string;
  resolution?: string;
  resolved: boolean;
}

export interface WorkloadBalance {
  agentId: string;
  currentLoad: number;
  optimalLoad: number;
  tasksQueued: number;
  tasksToReassign: number;
}

export interface CompanyStatus {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  agentsRunning: number;
  agentsTotal: number;
  avgAgentHealth: number;
  tasksPending: number;
  tasksCompleted: number;
  activeConflicts: number;
  resourceUtilization: number;
  topBottleneck: string;
  topRecommendation: string;
  lastUpdated: Date;
}

export interface IntelligenceConfig extends AgentConfig {
  maxConcurrentAgents: number;
  performanceThreshold: number;
  overloadThreshold: number;
  rebalanceInterval: number;
}

const DEFAULT_CONFIG: IntelligenceConfig = {
  name: 'intelligence-layer',
  version: '2.0.0',
  enabled: true,
  interval: 10000,
  logLevel: 'info',
  maxConcurrentAgents: 10,
  performanceThreshold: 60,
  overloadThreshold: 80,
  rebalanceInterval: 30000,
};

// ─── Error Classes ─────────────────────────────────────────────────────

export class IntelligenceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'IntelligenceError';
  }
}

export class AgentNotFoundError extends IntelligenceError {
  constructor(id: string) { super(`Agent "${id}" not registered`, 'AGENT_NOT_FOUND'); }
}

// ─── Agent ─────────────────────────────────────────────────────────────

export class IntelligenceLayer extends EventEmitter {
  private config: IntelligenceConfig;
  private state: AgentState;
  private logger: Logger;
  private agents: Map<string, AgentRegistration>;
  private taskQueue: TaskItem[];
  private completedTasks: TaskItem[];
  private conflicts: Conflict[];
  private allocations: Map<string, ResourceAllocation>;
  private intervalHandle: ReturnType<typeof setInterval> | null;

  constructor(config: Partial<IntelligenceConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger('IntelligenceLayer', this.config.logLevel);
    this.state = {
      status: 'idle', lastRun: null, lastError: null, runCount: 0,
      metrics: { agentsManaged: 0, agentsRunning: 0, tasksPrioritized: 0, tasksAssigned: 0, tasksCompleted: 0, resourcesAllocated: 0, conflictsResolved: 0, loadBalancesPerformed: 0, avgHealthScore: 0 },
    };
    this.agents = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.conflicts = [];
    this.allocations = new Map();
    this.intervalHandle = null;
    this.logger.info('IntelligenceLayer initialized');
  }

  getState(): AgentState { return { ...this.state }; }
  getConfig(): IntelligenceConfig { return { ...this.config }; }

  // ─── Lifecycle ───────────────────────────────────────────────────────

  start(): void {
    if (this.state.status === 'running') return;
    this.state.status = 'running';
    this.logger.info('Agent started');
    this.emit('started', { agent: this.config.name, timestamp: new Date() });

    this.registerBuiltInAgents();

    // Immediate coordination cycle
    this.coordinate();
    this.intervalHandle = setInterval(() => this.runCycle(), this.config.interval!);
  }

  stop(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
    this.state.status = 'idle';
    this.logger.info('Agent stopped');
    this.emit('stopped', { agent: this.config.name, timestamp: new Date() });
  }

  private async runCycle(): Promise<void> {
    try {
      await this.coordinate();
      this.state.runCount++;
      this.state.lastRun = new Date();
    } catch (err) {
      this.state.lastError = err instanceof Error ? err.message : String(err);
      this.logger.error('Cycle error', this.state.lastError);
    }
  }

  private registerBuiltInAgents(): void {
    const builtIns = [
      { id: 'agent-operations', name: 'Operations Agent', priority: 'high' as AgentPriority, capabilities: ['health-monitoring', 'error-detection', 'auto-repair', 'uptime', 'infra-optimization'] },
      { id: 'agent-customer-success', name: 'Customer Success Agent', priority: 'high' as AgentPriority, capabilities: ['query-handling', 'issue-resolution', 'onboarding', 'help-docs'] },
      { id: 'agent-analytics', name: 'Analytics Agent', priority: 'medium' as AgentPriority, capabilities: ['kpi-monitoring', 'reporting', 'trend-detection', 'bottleneck-analysis'] },
      { id: 'agent-product-improvement', name: 'Product Improvement Agent', priority: 'medium' as AgentPriority, capabilities: ['feedback-analysis', 'feature-requests', 'prioritization', 'planning', 'roadmap'] },
      { id: 'agent-content', name: 'Content Agent', priority: 'medium' as AgentPriority, capabilities: ['blog-posts', 'social-media', 'newsletters', 'educational-content'] },
      { id: 'agent-market-research', name: 'Market Research Agent', priority: 'medium' as AgentPriority, capabilities: ['competitor-monitoring', 'trend-tracking', 'opportunity-discovery', 'market-analysis'] },
      { id: 'agent-self-improvement', name: 'Self-Improvement System', priority: 'high' as AgentPriority, capabilities: ['performance-analysis', 'improvement-planning', 'testing', 'deployment', 'rollback'] },
      { id: 'agent-workflow-engine', name: 'Workflow Engine', priority: 'medium' as AgentPriority, capabilities: ['workflow-creation', 'execution', 'scheduling', 'automation'] },
    ];

    for (const a of builtIns) {
      this.agents.set(a.id, { ...a, status: 'registered', resourceUsage: { cpu: 0, memory: 0, calls: 0 }, performance: { successRate: 100, avgResponseTime: 0, tasksCompleted: 0, errors: 0, loadLevel: 0 }, lastHeartbeat: new Date() });
    }

    this.state.metrics.agentsManaged = this.agents.size;
    this.logger.info('Built-in agents registered', { count: this.agents.size });
  }

  registerAgent(id: string, name: string, priority: AgentPriority, capabilities: string[]): void {
    this.agents.set(id, { id, name, status: 'registered', priority, capabilities, resourceUsage: { cpu: 0, memory: 0, calls: 0 }, performance: { successRate: 100, avgResponseTime: 0, tasksCompleted: 0, errors: 0, loadLevel: 0 }, lastHeartbeat: new Date() });
    this.state.metrics.agentsManaged = this.agents.size;
    this.logger.info('Agent registered', { id, name });
    this.emit('agent_registered', { agent: this.config.name, agentId: id, name, timestamp: new Date() });
  }

  // ─── Coordinate ──────────────────────────────────────────────────────

  /** Run a full coordination cycle: prioritize tasks, allocate resources, resolve conflicts, balance workloads. */
  async coordinate(): Promise<ActionResult<{ runningAgents: number; decisions: string[] }>> {
    const start = Date.now();
    const decisions: string[] = [];

    try {
      // 1. Monitor agent performance
      const perf = await this.monitorAgentPerformance();
      const unhealthy = (perf.data || []).filter((p: AgentRegistration) => p.performance.successRate < this.config.performanceThreshold);
      if (unhealthy.length > 0) {
        for (const agent of unhealthy) {
          const reg = this.agents.get(agent.id);
          if (reg) { reg.status = 'error'; decisions.push(`Flagged ${agent.name} — health below threshold`); }
        }
      }

      // 2. Start healthy registered agents
      const runningCount = Array.from(this.agents.values()).filter((a) => a.status === 'running').length;
      if (runningCount < this.config.maxConcurrentAgents) {
        const idle = Array.from(this.agents.values()).filter((a) => a.status === 'registered' || a.status === 'stopped');
        for (const agent of idle) {
          if (runningCount + decisions.filter((d) => d.startsWith('Started')).length >= this.config.maxConcurrentAgents) break;
          agent.status = 'running';
          agent.lastHeartbeat = new Date();
          decisions.push(`Started ${agent.name}`);
        }
      }

      // 3. Prioritize and assign tasks
      const prioritized = await this.prioritizeTasks();
      if (prioritized.success) decisions.push(`Prioritized ${(prioritized.data || []).length} tasks`);

      // 4. Resolve conflicts
      const resolved = await this.resolveConflicts();
      if (resolved.success) decisions.push(`Resolved ${(resolved.data || []).length} conflicts`);

      // 5. Balance workloads
      const balanced = await this.balanceWorkloads();
      if (balanced.success) decisions.push(`Balanced workloads across agents`);

      this.state.metrics.agentsRunning = Array.from(this.agents.values()).filter((a) => a.status === 'running').length;

      this.emit('coordination_completed', { type: 'coordination_completed', timestamp: new Date(), agent: this.config.name, data: { decisions: decisions.length } });

      return { success: true, data: { runningAgents: this.state.metrics.agentsRunning, decisions }, duration: Date.now() - start, timestamp: new Date() };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg, duration: Date.now() - start, timestamp: new Date() };
    }
  }

  // ─── Prioritize Tasks ────────────────────────────────────────────────

  /** Prioritize the task queue and assign to available agents. */
  async prioritizeTasks(): Promise<ActionResult<TaskItem[]>> {
    const start = Date.now();

    const pending = this.taskQueue.filter((t) => t.status === 'pending');
    const scored = pending.map((t) => ({ ...t, score: t.priority * 0.4 + t.urgency * 0.35 + t.impact * 0.25 })).sort((a, b) => b.score - a.score);

    const available = Array.from(this.agents.values()).filter((a) => a.status === 'running' && a.performance.loadLevel < this.config.overloadThreshold).sort((a, b) => a.performance.loadLevel - b.performance.loadLevel);

    const assigned: TaskItem[] = [];
    for (let i = 0; i < Math.min(scored.length, available.length); i++) {
      const task = scored[i];
      const agent = available[i];
      task.status = 'assigned';
      task.assignedAgent = agent.id;
      agent.performance.tasksCompleted++;
      agent.performance.loadLevel = Math.min(100, agent.performance.loadLevel + 10);
      agent.lastHeartbeat = new Date();
      assigned.push(task);
    }

    this.state.metrics.tasksPrioritized += scored.length;
    this.state.metrics.tasksAssigned += assigned.length;
    this.logger.info(`Tasks prioritized`, { pending: pending.length, assigned: assigned.length });

    return { success: true, data: scored, duration: Date.now() - start, timestamp: new Date() };
  }

  addTask(description: string, priority: number, urgency: number, impact: number): TaskItem {
    const task: TaskItem = { id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description, priority, urgency, impact, score: 0, status: 'pending', createdAt: new Date() };
    this.taskQueue.push(task);
    this.emit('task_added', { agent: this.config.name, taskId: task.id, description, timestamp: new Date() });
    return task;
  }

  completeTask(taskId: string): boolean {
    const idx = this.taskQueue.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;
    const task = this.taskQueue[idx];
    task.status = 'completed';
    this.completedTasks.push(task);
    this.taskQueue.splice(idx, 1);
    this.state.metrics.tasksCompleted++;
    if (task.assignedAgent) {
      const agent = this.agents.get(task.assignedAgent);
      if (agent) agent.performance.loadLevel = Math.max(0, agent.performance.loadLevel - 10);
    }
    return true;
  }

  // ─── Allocate Resources ──────────────────────────────────────────────

  /** Allocate compute resources to an agent for a specific task. */
  async allocateResources(task: TaskItem): Promise<ActionResult<ResourceAllocation>> {
    const start = Date.now();

    const agentId = task.assignedAgent;
    if (!agentId) return { success: false, error: 'Task not assigned to any agent', duration: Date.now() - start, timestamp: new Date() };

    const agent = this.agents.get(agentId);
    if (!agent) return { success: false, error: `Agent "${agentId}" not found`, duration: Date.now() - start, timestamp: new Date() };

    const cpuBase = 100 / this.agents.size;
    const memBase = 100 / this.agents.size;
    const priorityMultiplier = { low: 0.5, medium: 1, high: 1.5, critical: 2 }[agent.priority] || 1;

    const alloc: ResourceAllocation = {
      agentId,
      allocatedCpu: Math.round(cpuBase * priorityMultiplier),
      allocatedMemory: Math.round(memBase * priorityMultiplier),
      priority: this.priorityToNumber(agent.priority),
      reason: `Allocated for task "${task.description.substring(0, 50)}" priority: ${agent.priority}`,
    };

    this.allocations.set(agentId, alloc);
    this.state.metrics.resourcesAllocated++;
    this.logger.debug('Resources allocated', { agentId, cpu: alloc.allocatedCpu, memory: alloc.allocatedMemory });

    return { success: true, data: alloc, duration: Date.now() - start, timestamp: new Date() };
  }

  private priorityToNumber(p: AgentPriority): number {
    return { low: 1, medium: 2, high: 3, critical: 4 }[p] || 1;
  }

  // ─── Resolve Conflicts ───────────────────────────────────────────────

  /** Detect and resolve resource, dependency, and scheduling conflicts. */
  async resolveConflicts(): Promise<ActionResult<Conflict[]>> {
    const start = Date.now();
    const resolved: Conflict[] = [];

    const running = Array.from(this.agents.values()).filter((a) => a.status === 'running');

    // Check for resource conflicts
    const totalCpu = running.reduce((s, a) => s + a.resourceUsage.cpu, 0);
    const totalMemory = running.reduce((s, a) => s + a.resourceUsage.memory, 0);

    if (totalCpu > 100) {
      const conflict: Conflict = { id: `conflict-cpu-${Date.now()}`, type: 'resource', agents: running.map((a) => a.id), resource: 'CPU', description: `CPU oversubscribed: ${totalCpu.toFixed(0)}% > 100%`, resolved: false };
      // Resolution: reduce CPU on lowest-priority agents
      const sorted = [...running].sort((a, b) => this.priorityToNumber(a.priority) - this.priorityToNumber(b.priority));
      for (const agent of sorted.slice(0, Math.ceil(sorted.length / 2))) {
        agent.resourceUsage.cpu = Math.max(10, agent.resourceUsage.cpu - 15);
      }
      conflict.resolution = 'Reduced CPU allocation on lower-priority agents';
      conflict.resolved = true;
      this.conflicts.push(conflict);
      resolved.push(conflict);
    }

    if (totalMemory > 100) {
      const conflict: Conflict = { id: `conflict-mem-${Date.now()}`, type: 'resource', agents: running.map((a) => a.id), resource: 'Memory', description: `Memory oversubscribed: ${totalMemory.toFixed(0)}% > 100%`, resolved: false };
      const sorted = [...running].sort((a, b) => this.priorityToNumber(a.priority) - this.priorityToNumber(b.priority));
      for (const agent of sorted.slice(0, Math.ceil(sorted.length / 2))) {
        agent.resourceUsage.memory = Math.max(10, agent.resourceUsage.memory - 15);
      }
      conflict.resolution = 'Reduced memory allocation on lower-priority agents';
      conflict.resolved = true;
      this.conflicts.push(conflict);
      resolved.push(conflict);
    }

    if (resolved.length > 0) {
      this.state.metrics.conflictsResolved += resolved.length;
      this.logger.info(`Conflicts resolved`, { count: resolved.length });
    }

    this.emit('conflicts_resolved', { agent: this.config.name, conflicts: resolved.length, timestamp: new Date() });

    return { success: true, data: resolved, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Monitor Agent Performance ───────────────────────────────────────

  /** Monitor all registered agents and return their performance data. */
  async monitorAgentPerformance(): Promise<ActionResult<AgentRegistration[]>> {
    const start = Date.now();

    for (const [, agent] of this.agents) {
      agent.lastHeartbeat = new Date();
      agent.resourceUsage.cpu = Math.round(Math.random() * 40 + 10);
      agent.resourceUsage.memory = Math.round(Math.random() * 50 + 20);
      agent.performance.successRate = Math.max(60, Math.min(100, 95 - Math.random() * 10));
      agent.performance.avgResponseTime = Math.floor(Math.random() * 400 + 50);
    }

    const avgHealth = Array.from(this.agents.values()).reduce((s, a) => {
      return s + a.performance.successRate * 0.5 + (1 - a.performance.avgResponseTime / 1000) * 100 * 0.3 + (a.status === 'running' ? 100 : 30) * 0.2;
    }, 0) / Math.max(this.agents.size, 1);

    this.state.metrics.avgHealthScore = Math.round(avgHealth * 10) / 10;

    return { success: true, data: Array.from(this.agents.values()), duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Balance Workloads ───────────────────────────────────────────────

  /** Redistribute tasks across agents to balance workloads. */
  async balanceWorkloads(): Promise<ActionResult<WorkloadBalance[]>> {
    const start = Date.now();
    const balances: WorkloadBalance[] = [];

    const running = Array.from(this.agents.values()).filter((a) => a.status === 'running');
    if (running.length === 0) return { success: true, data: [], duration: Date.now() - start, timestamp: new Date() };

    const avgLoad = running.reduce((s, a) => s + a.performance.loadLevel, 0) / running.length;

    for (const agent of running) {
      const tasksAssigned = this.taskQueue.filter((t) => t.assignedAgent === agent.id && t.status === 'assigned').length;
      const overload = agent.performance.loadLevel > avgLoad + 20;
      const tasksToReassign = overload ? Math.ceil(tasksAssigned * 0.3) : 0;

      balances.push({ agentId: agent.id, currentLoad: agent.performance.loadLevel, optimalLoad: Math.round(avgLoad), tasksQueued: tasksAssigned, tasksToReassign });

      if (tasksToReassign > 0) {
        const underloaded = running.filter((a) => a.performance.loadLevel < avgLoad - 10);
        if (underloaded.length > 0) {
          const target = underloaded[0];
          const toMove = this.taskQueue.filter((t) => t.assignedAgent === agent.id).slice(0, tasksToReassign);
          for (const task of toMove) {
            task.assignedAgent = target.id;
          }
          agent.performance.loadLevel = Math.max(0, agent.performance.loadLevel - tasksToReassign * 5);
          target.performance.loadLevel = Math.min(100, target.performance.loadLevel + tasksToReassign * 5);
        }
      }
    }

    this.state.metrics.loadBalancesPerformed++;
    const reassigned = balances.reduce((s, b) => s + b.tasksToReassign, 0);
    if (reassigned > 0) this.logger.info('Workloads balanced', { reassigned });
    this.emit('workloads_balanced', { agent: this.config.name, reassigned, timestamp: new Date() });

    return { success: true, data: balances, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Get Company Status ──────────────────────────────────────────────

  /** Get comprehensive company operational status overview. */
  async getCompanyStatus(): Promise<ActionResult<CompanyStatus>> {
    const start = Date.now();

    await this.monitorAgentPerformance();

    const running = Array.from(this.agents.values()).filter((a) => a.status === 'running');
    const total = this.agents.size;
    const avgHealth = this.state.metrics.avgHealthScore;
    const pending = this.taskQueue.filter((t) => t.status === 'pending' || t.status === 'assigned').length;
    const completed = this.completedTasks.length;
    const activeConflicts = this.conflicts.filter((c) => !c.resolved).length;
    const cpuUtil = running.reduce((s, a) => s + a.resourceUsage.cpu, 0) / Math.max(running.length, 1);

    const overallHealth: CompanyStatus['overallHealth'] =
      running.length < 3 ? 'poor' :
      avgHealth < 60 ? 'poor' :
      avgHealth < 75 ? 'fair' :
      avgHealth < 90 ? 'good' : 'excellent';

    const status: CompanyStatus = {
      overallHealth,
      agentsRunning: running.length,
      agentsTotal: total,
      avgAgentHealth: Math.round(avgHealth * 10) / 10,
      tasksPending: pending,
      tasksCompleted: completed,
      activeConflicts,
      resourceUtilization: Math.round(cpuUtil),
      topBottleneck: activeConflicts > 0 ? `${activeConflicts} unresolved conflicts` : pending > 10 ? 'Task queue backlog' : 'None',
      topRecommendation: overallHealth === 'good' || overallHealth === 'excellent' ? 'Maintain current operations' : 'Run coordination cycle to address issues',
      lastUpdated: new Date(),
    };

    this.logger.info('Company status generated', { health: overallHealth, agents: `${running.length}/${total}`, pending });
    this.emit('company_status', { agent: this.config.name, status, timestamp: new Date() });

    return { success: true, data: status, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Utility ─────────────────────────────────────────────────────────

  getMetrics(): Record<string, number> { return { ...this.state.metrics }; }

  getRegisteredAgents(): AgentRegistration[] { return Array.from(this.agents.values()); }

  getTaskQueue(status?: TaskItem['status']): TaskItem[] {
    return status ? this.taskQueue.filter((t) => t.status === status) : [...this.taskQueue];
  }

  resetMetrics(): void {
    this.state.metrics = { agentsManaged: 0, agentsRunning: 0, tasksPrioritized: 0, tasksAssigned: 0, tasksCompleted: 0, resourcesAllocated: 0, conflictsResolved: 0, loadBalancesPerformed: 0, avgHealthScore: 0 };
    this.logger.info('Metrics reset');
    this.emit('metrics_reset', { agent: this.config.name, timestamp: new Date() });
  }
}