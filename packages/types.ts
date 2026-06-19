/**
 * Aether Autonomous Operations — Shared Types
 *
 * Core types used across all business agent packages.
 */

export type AgentStatus = 'idle' | 'running' | 'error' | 'completed' | 'paused';
export type AgentPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AgentConfig {
  name: string;
  version: string;
  enabled: boolean;
  interval?: number;
  logLevel?: LogLevel;
  maxRetries?: number;
}

export interface AgentEvent {
  type: string;
  timestamp: Date;
  agent: string;
  data: Record<string, unknown>;
}

export interface AgentState {
  status: AgentStatus;
  lastRun: Date | null;
  lastError: string | null;
  runCount: number;
  metrics: Record<string, number>;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  action: string;
  params: Record<string, unknown>;
  dependsOn?: string[];
  timeout?: number;
  retries?: number;
}

export interface BusinessMetrics {
  kpi: string;
  value: number;
  previousValue: number;
  change: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: Date;
  metrics: BusinessMetrics[];
  insights: string[];
  recommendations: string[];
  rawData: Record<string, unknown>;
}

export interface CustomerQuery {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  body: string;
  priority: AgentPriority;
  category: 'bug' | 'feature_request' | 'question' | 'billing' | 'onboarding' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export interface FeedbackItem {
  id: string;
  source: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  priority: AgentPriority;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export interface CompetitorInfo {
  name: string;
  website: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  lastChecked: Date;
  products: string[];
  pricing: Record<string, unknown>;
}

export interface ContentItem {
  id: string;
  type: 'blog_post' | 'social_post' | 'newsletter' | 'doc' | 'tutorial';
  title: string;
  body: string;
  status: 'draft' | 'review' | 'published';
  tags: string[];
  scheduledFor?: Date;
  publishedAt?: Date;
  metrics?: { views: number; clicks: number; engagement: number };
}