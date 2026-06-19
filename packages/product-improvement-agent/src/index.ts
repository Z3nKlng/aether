/**
 * Product Improvement Agent
 *
 * Analyzes user feedback (sentiment, category, urgency scoring), detects feature requests,
 * prioritizes using RICE scoring (Reach, Impact, Confidence, Effort), generates
 * implementation plans, and produces a roadmap (short/medium/long-term).
 *
 * Methods:
 *  - analyzeFeedback(feedback[])     — Analyze feedback: sentiment, category, urgency
 *  - detectFeatureRequests()         — Extract feature requests from feedback
 *  - prioritize(features[])          — RICE scoring: Reach, Impact, Confidence, Effort
 *  - generatePlan()                  — Generate implementation plan from prioritized items
 *  - getRoadmap()                    — Get roadmap: short-term (1-4w), medium (1-3m), long (3-6m)
 *  - getMetrics()                    — Returns current metrics snapshot
 */

import { EventEmitter } from 'events';
import type { AgentConfig, AgentEvent, AgentState, ActionResult, FeedbackItem, AgentPriority, LogLevel } from '../../types';
import { Logger } from '../../logger';

// ─── Types ─────────────────────────────────────────────────────────────

export interface RICEScore {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  score: number;  // (Reach × Impact × Confidence) / Effort
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  source: string;
  frequency: number;
  category: string;
  createdAt: Date;
  status: 'new' | 'under_review' | 'planned' | 'in_development' | 'shipped' | 'declined';
  votes: number;
  rice?: RICEScore;
}

export interface RoadmapItem {
  id: string;
  title: string;
  category: string;
  horizon: 'short_term' | 'medium_term' | 'long_term';
  timeframe: string;
  rationale: string;
  riceScore: number;
  status: FeatureRequest['status'];
}

export interface FeedbackAnalysis {
  total: number;
  bySource: Record<string, number>;
  bySentiment: Record<string, number>;
  byCategory: Record<string, number>;
  overallSentiment: number;  // -1 to 1
  topComplaints: string[];
  topPraises: string[];
  urgencyScore: number;  // 0-100
}

export interface ImplementationPhase {
  id: string;
  name: string;
  tasks: string[];
  effort: number;
  order: number;
}

export interface ImplementationPlan {
  id: string;
  title: string;
  featureId: string;
  phases: ImplementationPhase[];
  totalEffort: number;
  risk: 'low' | 'medium' | 'high';
  riceScore: number;
  createdAt: Date;
}

export interface ProductImprovementConfig extends AgentConfig {
  minVotesThreshold: number;
  feedbackSources: string[];
  riceWeights: { reach: number; impact: number; confidence: number; effort: number };
}

const DEFAULT_CONFIG: ProductImprovementConfig = {
  name: 'product-improvement-agent',
  version: '2.0.0',
  enabled: true,
  interval: 60000,
  logLevel: 'info',
  minVotesThreshold: 3,
  feedbackSources: ['in-app', 'support-tickets', 'community', 'social-media', 'reviews'],
  riceWeights: { reach: 1, impact: 1, confidence: 1, effort: 1 },
};

// ─── Error Classes ─────────────────────────────────────────────────────

export class ProductImprovementError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ProductImprovementError';
  }
}

export class FeatureNotFoundError extends ProductImprovementError {
  constructor(id: string) { super(`Feature "${id}" not found`, 'FEATURE_NOT_FOUND'); }
}

// ─── Agent ─────────────────────────────────────────────────────────────

export class ProductImprovementAgent extends EventEmitter {
  private config: ProductImprovementConfig;
  private state: AgentState;
  private logger: Logger;
  private feedback: FeedbackItem[];
  private featureRequests: FeatureRequest[];
  private plans: ImplementationPlan[];
  private intervalHandle: ReturnType<typeof setInterval> | null;

  constructor(config: Partial<ProductImprovementConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger('ProductImprovementAgent', this.config.logLevel);
    this.state = {
      status: 'idle', lastRun: null, lastError: null, runCount: 0,
      metrics: { feedbackAnalyzed: 0, featureRequestsDetected: 0, itemsPrioritized: 0, plansGenerated: 0, featuresShipped: 0, avgTimeToShip: 0 },
    };
    this.feedback = [];
    this.featureRequests = [];
    this.plans = [];
    this.intervalHandle = null;
    this.logger.info('ProductImprovementAgent initialized');
  }

  getState(): AgentState { return { ...this.state }; }
  getConfig(): ProductImprovementConfig { return { ...this.config }; }

  // ─── Lifecycle ───────────────────────────────────────────────────────

  start(): void {
    if (this.state.status === 'running') return;
    this.state.status = 'running';
    this.logger.info('Agent started');
    this.emit('started', { agent: this.config.name, timestamp: new Date() });
    this.intervalHandle = setInterval(() => this.runCycle(), this.config.interval!);
  }

  stop(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null; this.state.status = 'idle';
    this.logger.info('Agent stopped');
    this.emit('stopped', { agent: this.config.name, timestamp: new Date() });
  }

  private async runCycle(): Promise<void> {
    try { this.state.runCount++; this.state.lastRun = new Date(); } catch (err) {
      this.state.lastError = err instanceof Error ? err.message : String(err);
      this.logger.error('Cycle error', this.state.lastError);
      this.emit('cycle_error', { agent: this.config.name, error: this.state.lastError, timestamp: new Date() });
    }
  }

  // ─── Ingest Feedback ─────────────────────────────────────────────────

  ingestFeedback(item: FeedbackItem): void {
    this.feedback.push(item);
    this.state.metrics.feedbackAnalyzed++;
    this.emit('feedback_ingested', { agent: this.config.name, feedbackId: item.id, sentiment: item.sentiment, timestamp: new Date() });
  }

  ingestMultipleFeedback(items: FeedbackItem[]): void {
    items.forEach((item) => this.ingestFeedback(item));
  }

  // ─── Analyze Feedback ────────────────────────────────────────────────

  /**
   * Analyze feedback: sentiment scoring, category breakdown, urgency detection.
   */
  async analyzeFeedback(feedbackToAnalyze?: FeedbackItem[]): Promise<ActionResult<FeedbackAnalysis>> {
    const start = Date.now();
    const items = feedbackToAnalyze || this.feedback;

    const bySource: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const item of items) {
      bySource[item.source] = (bySource[item.source] || 0) + 1;
      bySentiment[item.sentiment] = (bySentiment[item.sentiment] || 0) + 1;
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }

    const total = items.length;
    const pos = bySentiment['positive'] || 0;
    const neg = bySentiment['negative'] || 0;
    const overallSentiment = total > 0 ? (pos - neg) / total : 0;

    const negatives = items.filter((f) => f.sentiment === 'negative').slice(0, 5);
    const positives = items.filter((f) => f.sentiment === 'positive').slice(0, 5);

    // Urgency: ratio of negative + high priority feedback
    const urgentCount = items.filter((f) => f.sentiment === 'negative' || f.priority === 'high' || f.priority === 'critical').length;
    const urgencyScore = total > 0 ? Math.round((urgentCount / total) * 100) : 0;

    const analysis: FeedbackAnalysis = {
      total,
      bySource,
      bySentiment,
      byCategory,
      overallSentiment,
      topComplaints: negatives.map((f) => f.text.substring(0, 120)),
      topPraises: positives.map((f) => f.text.substring(0, 120)),
      urgencyScore,
    };

    this.logger.info('Feedback analyzed', { total, sentiment: overallSentiment.toFixed(2), urgency: urgencyScore });
    this.emit('feedback_analyzed', { agent: this.config.name, analysis, timestamp: new Date() });

    return { success: true, data: analysis, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Detect Feature Requests ─────────────────────────────────────────

  /**
   * Extract feature requests from feedback using keyword pattern matching.
   */
  async detectFeatureRequests(feedbackToScan?: FeedbackItem[]): Promise<ActionResult<FeatureRequest[]>> {
    const start = Date.now();
    const newRequests: FeatureRequest[] = [];
    const items = feedbackToScan || this.feedback;

    const patterns: Array<{ keyword: string; title: string; category: string; priority: AgentPriority }> = [
      { keyword: 'template', title: 'Pre-built Project Templates Gallery', category: 'onboarding', priority: 'high' },
      { keyword: 'dark mode', title: 'Enhanced Dark Mode Themes', category: 'ui', priority: 'medium' },
      { keyword: 'export', title: 'One-Click Export to GitHub', category: 'integration', priority: 'high' },
      { keyword: 'cli', title: 'Aether CLI for Headless Operations', category: 'developer-experience', priority: 'high' },
      { keyword: 'team', title: 'Advanced Team Collaboration', category: 'collaboration', priority: 'high' },
      { keyword: 'monitor', title: 'App Monitoring Dashboard', category: 'observability', priority: 'medium' },
      { keyword: 'api', title: 'Public Aether API', category: 'platform', priority: 'high' },
      { keyword: 'mobile', title: 'Mobile Preview & Testing', category: 'deployment', priority: 'low' },
      { keyword: 'plugin', title: 'Plugin & Extensions Marketplace', category: 'platform', priority: 'low' },
      { keyword: 'analytics', title: 'Built-in App Analytics', category: 'analytics', priority: 'medium' },
      { keyword: 'database', title: 'Database GUI & Management', category: 'development', priority: 'medium' },
      { keyword: 'webhook', title: 'Webhook Integrations', category: 'integration', priority: 'medium' },
      { keyword: 'search', title: 'Global Code Search', category: 'developer-experience', priority: 'low' },
      { keyword: 'collaborate', title: 'Real-Time Collaborative Editing', category: 'collaboration', priority: 'high' },
      { keyword: 'customize', title: 'Customizable Dashboard & IDE', category: 'ui', priority: 'low' },
    ];

    for (const item of items) {
      const lower = item.text.toLowerCase();
      for (const pattern of patterns) {
        if (lower.includes(pattern.keyword)) {
          const existing = this.featureRequests.find((f) => f.title === pattern.title);
          if (existing) {
            existing.frequency++;
            existing.votes++;
          } else {
            newRequests.push({
              id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title: pattern.title,
              description: `Requested via ${item.source}: "${item.text.substring(0, 200)}"`,
              source: item.source, frequency: 1, category: pattern.category,
              createdAt: new Date(), status: 'new', votes: 1,
            });
          }
        }
      }
    }

    this.featureRequests.push(...newRequests);
    this.state.metrics.featureRequestsDetected += newRequests.length;
    this.logger.info(`Feature requests detected`, { new: newRequests.length, total: this.featureRequests.length });
    this.emit('feature_requests_detected', { agent: this.config.name, newRequests: newRequests.length, total: this.featureRequests.length, timestamp: new Date() });

    return { success: true, data: newRequests, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Prioritize (RICE) ───────────────────────────────────────────────

  /**
   * Prioritize features using RICE scoring: (Reach × Impact × Confidence) / Effort.
   */
  async prioritize(featuresToScore?: FeatureRequest[]): Promise<ActionResult<FeatureRequest[]>> {
    const start = Date.now();
    const features = featuresToScore || this.featureRequests.filter((f) => f.status === 'new' || f.status === 'under_review');

    for (const feat of features) {
      const reach = this.scoreReach(feat);
      const impact = this.scoreImpact(feat);
      const confidence = this.scoreConfidence(feat);
      const effort = this.scoreEffort(feat);

      const score = effort > 0 ? (reach * impact * confidence) / effort : 0;

      feat.rice = {
        reach: Math.round(reach * 10) / 10,
        impact: Math.round(impact * 10) / 10,
        confidence: Math.round(confidence * 10) / 10,
        effort: Math.round(effort * 10) / 10,
        score: Math.round(score * 100) / 100,
      };
    }

    features.sort((a, b) => (b.rice?.score || 0) - (a.rice?.score || 0));

    this.state.metrics.itemsPrioritized = features.length;
    if (features.length > 0) {
      this.logger.info('RICE prioritization complete', { top: features[0]?.title, topScore: features[0]?.rice?.score });
    }
    this.emit('prioritization_completed', { agent: this.config.name, itemsPrioritized: features.length, timestamp: new Date() });

    return { success: true, data: features, duration: Date.now() - start, timestamp: new Date() };
  }

  /* RICE scoring helpers — each returns 1-10 */
  private scoreReach(feat: FeatureRequest): number {
    const catScores: Record<string, number> = {
      'collaboration': 9, 'integration': 8, 'developer-experience': 8, 'onboarding': 7,
      'platform': 7, 'ui': 6, 'observability': 6, 'analytics': 5, 'deployment': 5, 'development': 4,
    };
    return Math.min(feat.frequency * 2 + (catScores[feat.category] || 5) + feat.votes * 0.5, 10);
  }

  private scoreImpact(feat: FeatureRequest): number {
    const priorities: Record<AgentPriority, number> = { low: 3, medium: 5, high: 8, critical: 10 };
    return priorities[feat.priority] || 5;
  }

  private scoreConfidence(feat: FeatureRequest): number {
    const sourceConfidence: Record<string, number> = {
      'support-tickets': 9, 'in-app': 8, 'community': 6, 'reviews': 5, 'social-media': 4,
    };
    const freqBonus = Math.min(feat.frequency * 0.5, 3);
    return Math.min((sourceConfidence[feat.source] || 5) + freqBonus, 10);
  }

  private scoreEffort(feat: FeatureRequest): number {
    const catEffort: Record<string, number> = {
      'ui': 3, 'onboarding': 4, 'deployment': 4, 'analytics': 6,
      'developer-experience': 5, 'integration': 7, 'collaboration': 8,
      'observability': 6, 'platform': 9, 'development': 5,
    };
    return Math.max(catEffort[feat.category] || 5, 1);
  }

  // ─── Generate Plan ───────────────────────────────────────────────────

  /**
   * Generate an implementation plan for a prioritised feature request.
   */
  async generatePlan(featureId?: string): Promise<ActionResult<ImplementationPlan>> {
    const start = Date.now();

    // If no featureId, pick the highest-priority planned feature
    const targetId = featureId || this.featureRequests.filter((f) => f.status === 'planned' || f.status === 'under_review').sort((a, b) => (b.rice?.score || 0) - (a.rice?.score || 0))[0]?.id;

    const feature = this.featureRequests.find((f) => f.id === targetId);
    if (!feature) return { success: false, error: 'No feature found to plan for', duration: Date.now() - start, timestamp: new Date() };

    feature.status = 'planned';
    const planId = `plan-${Date.now()}`;

    const plan: ImplementationPlan = {
      id: planId,
      title: feature.title,
      featureId: feature.id,
      riceScore: feature.rice?.score || 0,
      risk: feature.priority === 'critical' ? 'high' : feature.priority === 'high' ? 'medium' : 'low',
      totalEffort: Math.max(Math.round((feature.rice?.effort || 5) * 2), 5),
      createdAt: new Date(),
      phases: [
        { id: `${planId}-p1`, name: 'Research & Requirements', tasks: ['Gather detailed requirements', 'Analyze user needs', 'Review with stakeholders', 'Create technical spec'], effort: 3, order: 1 },
        { id: `${planId}-p2`, name: 'Design & Architecture', tasks: ['Design system architecture', 'Create UI/UX mockups', 'Plan database schema', 'API contract design'], effort: 5, order: 2 },
        { id: `${planId}-p3`, name: 'Implementation', tasks: ['Implement backend services', 'Build frontend components', 'Add database migrations', 'Write unit/integration tests'], effort: 10, order: 3 },
        { id: `${planId}-p4`, name: 'Testing & QA', tasks: ['End-to-end testing', 'Performance benchmarks', 'Security review', 'Accessibility audit'], effort: 5, order: 4 },
        { id: `${planId}-p5`, name: 'Documentation & Release', tasks: ['Write user documentation', 'Update API docs', 'Prepare changelog', 'Deploy to production', 'Monitor rollout'], effort: 3, order: 5 },
      ],
    };

    this.plans.push(plan);
    this.state.metrics.plansGenerated++;
    this.logger.info('Plan generated', { title: feature.title, effort: plan.totalEffort });
    this.emit('plan_generated', { agent: this.config.name, planId, title: plan.title, timestamp: new Date() });

    return { success: true, data: plan, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Get Roadmap ─────────────────────────────────────────────────────

  /**
   * Get roadmap with short-term (1-4 weeks), medium-term (1-3 months), long-term (3-6 months) horizons.
   */
  async getRoadmap(): Promise<ActionResult<RoadmapItem[]>> {
    const start = Date.now();
    await this.prioritize();

    const sorted = [...this.featureRequests]
      .filter((f) => f.status !== 'declined')
      .sort((a, b) => (b.rice?.score || 0) - (a.rice?.score || 0));

    const items: RoadmapItem[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const feat = sorted[i];
      let horizon: RoadmapItem['horizon'];
      let timeframe: string;

      if (i < 3) { horizon = 'short_term'; timeframe = '1-4 weeks'; }
      else if (i < 8) { horizon = 'medium_term'; timeframe = '1-3 months'; }
      else { horizon = 'long_term'; timeframe = '3-6 months'; }

      items.push({
        id: feat.id,
        title: feat.title,
        category: feat.category,
        horizon,
        timeframe,
        rationale: `RICE: ${feat.rice?.score || 'N/A'} | Freq: ${feat.frequency} | Votes: ${feat.votes}`,
        riceScore: feat.rice?.score || 0,
        status: feat.status,
      });
    }

    this.logger.info(`Roadmap generated`, { items: items.length });
    this.emit('roadmap_generated', { agent: this.config.name, items: items.length, timestamp: new Date() });

    return { success: true, data: items, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Utility ─────────────────────────────────────────────────────────

  /** Ship a feature (mark it as shipped). */
  shipFeature(featureId: string): boolean {
    const feat = this.featureRequests.find((f) => f.id === featureId);
    if (!feat) return false;
    feat.status = 'shipped';
    this.state.metrics.featuresShipped++;
    this.logger.info('Feature shipped', { title: feat.title });
    this.emit('feature_shipped', { agent: this.config.name, featureId, title: feat.title, timestamp: new Date() });
    return true;
  }

  getFeatureRequests(status?: FeatureRequest['status']): FeatureRequest[] {
    return status ? this.featureRequests.filter((f) => f.status === status) : [...this.featureRequests];
  }

  getPlans(): ImplementationPlan[] { return [...this.plans]; }
  getMetrics(): Record<string, number> { return { ...this.state.metrics }; }

  resetMetrics(): void {
    this.state.metrics = { feedbackAnalyzed: 0, featureRequestsDetected: 0, itemsPrioritized: 0, plansGenerated: 0, featuresShipped: 0, avgTimeToShip: 0 };
    this.logger.info('Metrics reset');
    this.emit('metrics_reset', { agent: this.config.name, timestamp: new Date() });
  }
}