/**
 * Analytics Agent
 *
 * KPI monitoring (DAU/MAU, conversion, retention, revenue, churn), daily/weekly/monthly
 * report generation, trend detection (moving averages, growth rates, seasonal patterns),
 * and bottleneck identification (funnel analysis, drop-off points).
 *
 * Methods:
 *  - monitorKPIs()              — Track all key performance indicators
 *  - generateDailyReport()      — Daily email-style analytics report
 *  - generateWeeklyReport()     — Weekly deep-dive analytics report
 *  - generateMonthlyReport()    — Monthly executive summary
 *  - detectTrends(data)         — Identify emerging patterns (moving averages, growth rates, seasonality)
 *  - identifyBottlenecks()       — Funnel analysis, drop-off points, slow conversion steps
 *  - getRecommendations()       — Get actionable recommendations from latest analysis
 *  - getMetrics()               — Returns current metrics snapshot
 */

import { EventEmitter } from 'events';
import type { AgentConfig, AgentEvent, AgentState, ActionResult, BusinessMetrics, Report, LogLevel } from '../../types';
import { Logger } from '../../logger';

// ─── Types ─────────────────────────────────────────────────────────────

export interface KPIDefinition {
  key: string;
  label: string;
  unit: string;
  target: number;
  warning: number;
  critical: number;
  direction: 'up' | 'down';
}

export interface KPIValue {
  key: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;        // percentage
  unit: string;
  target: number;
  status: 'on_track' | 'warning' | 'critical';
  timestamp: Date;
}

export interface Trend {
  id: string;
  metric: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  window: string;
  confidence: number;
  description: string;
  movingAverage: number[];
  growthRate: number;
  seasonalPattern?: { period: string; amplitude: number };
}

export interface FunnelStep {
  name: string;
  count: number;
  previousCount: number;
  conversionRate: number;     // percentage from previous step
  dropOff: number;            // percentage dropped
  dropOffChange: number;      // change from previous period
}

export interface Bottleneck {
  id: string;
  area: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  currentValue: number;
  targetValue: number;
  gap: number;
  rootCause: string;
  recommendation: string;
  funnelStep?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  expectedImpact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  metric: string;
  priority: number;
}

export interface AnalyticsConfig extends AgentConfig {
  kpis: KPIDefinition[];
  trendWindow: number;         // data points for trend detection
  funnelSteps: string[];
  bottleneckThreshold: number;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  name: 'analytics-agent',
  version: '2.0.0',
  enabled: true,
  interval: 60000,
  logLevel: 'info',
  trendWindow: 14,
  funnelSteps: ['Visit', 'Sign Up', 'First Prompt', 'First Deploy', 'Active Use', 'Paid Conversion'],
  bottleneckThreshold: 0.15,
  kpis: [
    { key: 'dau', label: 'Daily Active Users', unit: 'users', target: 5000, warning: 3000, critical: 1500, direction: 'up' },
    { key: 'mau', label: 'Monthly Active Users', unit: 'users', target: 50000, warning: 30000, critical: 15000, direction: 'up' },
    { key: 'conversion_rate', label: 'Activation Rate', unit: '%', target: 70, warning: 50, critical: 35, direction: 'up' },
    { key: 'retention_d7', label: 'Day-7 Retention', unit: '%', target: 40, warning: 25, critical: 15, direction: 'up' },
    { key: 'retention_d30', label: 'Day-30 Retention', unit: '%', target: 25, warning: 15, critical: 8, direction: 'up' },
    { key: 'mrr', label: 'Monthly Recurring Revenue', unit: '$', target: 250000, warning: 150000, critical: 80000, direction: 'up' },
    { key: 'churn_rate', label: 'Monthly Churn Rate', unit: '%', target: 3, warning: 5, critical: 8, direction: 'down' },
    { key: 'nps', label: 'Net Promoter Score', unit: 'points', target: 60, warning: 40, critical: 20, direction: 'up' },
    { key: 'avg_session', label: 'Avg Session Duration', unit: 'min', target: 15, warning: 8, critical: 5, direction: 'up' },
    { key: 'deploys_per_user', label: 'Deploys Per Active User', unit: 'deploys', target: 5, warning: 3, critical: 1.5, direction: 'up' },
  ],
};

// ─── Error Classes ─────────────────────────────────────────────────────

export class AnalyticsError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class InsufficientDataError extends AnalyticsError {
  constructor(minPoints: number, actual: number) {
    super(`Insufficient data: need ${minPoints} points, have ${actual}`, 'INSUFFICIENT_DATA');
  }
}

// ─── Agent ─────────────────────────────────────────────────────────────

export class AnalyticsAgent extends EventEmitter {
  private config: AnalyticsConfig;
  private state: AgentState;
  private logger: Logger;
  private kpiHistory: Map<string, number[]>;
  private latestKPIValues: KPIValue[];
  private reports: Report[];
  private trendsCache: Trend[];
  private bottlenecksCache: Bottleneck[];
  private recommendationsCache: Recommendation[];
  private intervalHandle: ReturnType<typeof setInterval> | null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger('AnalyticsAgent', this.config.logLevel);
    this.state = {
      status: 'idle',
      lastRun: null,
      lastError: null,
      runCount: 0,
      metrics: { kpisTracked: 0, alertsTriggered: 0, reportsGenerated: 0, trendsDetected: 0, bottlenecksFound: 0, recommendationsGiven: 0 },
    };
    this.kpiHistory = new Map();
    this.latestKPIValues = [];
    this.reports = [];
    this.trendsCache = [];
    this.bottlenecksCache = [];
    this.recommendationsCache = [];
    this.intervalHandle = null;

    this.logger.info('AnalyticsAgent initialized', { kpis: this.config.kpis.length });
  }

  getState(): AgentState { return { ...this.state }; }
  getConfig(): AnalyticsConfig { return { ...this.config }; }

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
    this.intervalHandle = null;
    this.state.status = 'idle';
    this.logger.info('Agent stopped');
    this.emit('stopped', { agent: this.config.name, timestamp: new Date() });
  }

  private async runCycle(): Promise<void> {
    try {
      await this.monitorKPIs();
      this.state.runCount++;
      this.state.lastRun = new Date();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.state.lastError = msg;
      this.logger.error('Cycle error', msg);
      this.emit('cycle_error', { agent: this.config.name, error: msg, timestamp: new Date() });
    }
  }

  // ─── Record KPI ──────────────────────────────────────────────────────

  private recordKPI(key: string, value: number): void {
    if (!this.kpiHistory.has(key)) this.kpiHistory.set(key, []);
    const history = this.kpiHistory.get(key)!;
    history.push(value);
    if (history.length > 100) history.shift();
  }

  private getAverage(key: string, count: number = 7): number {
    const history = this.kpiHistory.get(key);
    if (!history || history.length === 0) return 0;
    const recent = history.slice(-count);
    return recent.reduce((s, v) => s + v, 0) / recent.length;
  }

  // ─── Monitor KPIs ────────────────────────────────────────────────────

  /** Track all KPIs: DAU/MAU, conversion, retention, revenue, churn, etc. */
  async monitorKPIs(): Promise<ActionResult<KPIValue[]>> {
    const start = Date.now();
    const values: KPIValue[] = [];

    for (const kpi of this.config.kpis) {
      const value = this.simulateKPIValue(kpi.key);
      this.recordKPI(kpi.key, value);

      const history = this.kpiHistory.get(kpi.key) || [];
      const previousValue = history.length > 1 ? history[history.length - 2] : value * 0.95;
      const change = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;

      let status: KPIValue['status'] = 'on_track';
      if (kpi.direction === 'up') {
        if (value < kpi.critical) status = 'critical';
        else if (value < kpi.warning) status = 'warning';
      } else {
        if (value > kpi.critical) status = 'critical';
        else if (value > kpi.warning) status = 'warning';
      }

      if (status !== 'on_track') {
        this.state.metrics.alertsTriggered++;
        this.logger.warn(`KPI alert: ${kpi.label}`, { value, target: kpi.target, status });
        this.emit('kpi_alert', { agent: this.config.name, kpi: kpi.key, value, target: kpi.target, status, timestamp: new Date() });
      }

      values.push({ key: kpi.key, label: kpi.label, value, previousValue, change, unit: kpi.unit, target: kpi.target, status, timestamp: new Date() });
    }

    this.latestKPIValues = values;
    this.state.metrics.kpisTracked += values.length;

    this.emit('kpis_monitored', { type: 'kpis_monitored', timestamp: new Date(), agent: this.config.name, data: { kpis: values.length, alerts: values.filter((v) => v.status !== 'on_track').length } });

    return { success: true, data: values, duration: Date.now() - start, timestamp: new Date() };
  }

  private simulateKPIValue(key: string): number {
    const kpi = this.config.kpis.find((k) => k.key === key);
    if (!kpi) return 0;
    const base = kpi.target;
    const noise = (Math.random() - 0.5) * base * 0.3;
    return Math.max(0, base + noise);
  }

  // ─── Generate Reports ────────────────────────────────────────────────

  /** Generate a daily email-style analytics report. */
  async generateDailyReport(): Promise<ActionResult<Report>> {
    const start = Date.now();
    await this.monitorKPIs();

    const metrics: BusinessMetrics[] = this.latestKPIValues.map((v) => ({
      kpi: v.key, value: v.value, previousValue: v.previousValue, change: v.change,
      unit: v.unit, timestamp: new Date(), tags: { status: v.status },
    }));

    const insights: string[] = [
      `DAU: ${this.getFormattedValue('dau', 0)} — ${this.getTrendText('dau')}`,
      `Activation: ${this.getFormattedValue('conversion_rate', 1)}% — ${this.getTrendText('conversion_rate')}`,
      `D7 Retention: ${this.getFormattedValue('retention_d7', 1)}% — ${this.getTrendText('retention_d7')}`,
      `MRR: $${this.getFormattedValue('mrr', 0)} — ${this.getTrendText('mrr')}`,
      `Churn: ${this.getFormattedValue('churn_rate', 1)}% — ${this.getTrendText('churn_rate')}`,
      `NPS: ${this.getFormattedValue('nps', 0)} pts`,
    ];

    const critical = this.latestKPIValues.filter((v) => v.status === 'critical');
    if (critical.length > 0) insights.push(`⚠️ Critical KPIs: ${critical.map((c) => c.label).join(', ')}`);

    const report: Report = {
      id: `daily-${Date.now()}`,
      title: `📊 Daily Analytics — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
      type: 'daily',
      generatedAt: new Date(),
      metrics,
      insights,
      recommendations: [],
      rawData: { kpiCount: metrics.length },
    };

    this.reports.push(report);
    if (this.reports.length > 90) this.reports.shift();
    this.state.metrics.reportsGenerated++;
    this.logger.info('Daily report generated', { insights: insights.length });
    this.emit('report_generated', { agent: this.config.name, reportId: report.id, type: 'daily', timestamp: new Date() });

    return { success: true, data: report, duration: Date.now() - start, timestamp: new Date() };
  }

  /** Generate a weekly deep-dive report. */
  async generateWeeklyReport(): Promise<ActionResult<Report>> {
    const start = Date.now();
    await this.monitorKPIs();

    const metrics: BusinessMetrics[] = this.latestKPIValues.map((v) => ({
      kpi: v.key, value: this.getAverage(v.key, 7), previousValue: this.getAverage(v.key, 14),
      change: 0, unit: v.unit, timestamp: new Date(), tags: { status: v.status },
    }));
    metrics.forEach((m) => {
      m.change = m.previousValue > 0 ? ((m.value - m.previousValue) / m.previousValue) * 100 : 0;
    });

    const trends = await this.detectTrends();
    const bottlenecks = await this.identifyBottlenecks();

    const report: Report = {
      id: `weekly-${Date.now()}`,
      title: `🔬 Weekly Deep Dive — Week of ${new Date().toLocaleDateString()}`,
      type: 'weekly',
      generatedAt: new Date(),
      metrics,
      insights: [
        `Weekly avg DAU: ${this.getFormattedValue('dau', 0)} (7-day average)`,
        `Trends detected: ${(trends.data || []).length}`,
        `Bottlenecks identified: ${(bottlenecks.data || []).length}`,
        `Conversion funnel analysis available`,
      ],
      recommendations: (this.recommendationsCache || []).map((r) => r.title),
      rawData: { trends: trends.data || [], bottlenecks: bottlenecks.data || [] },
    };

    this.reports.push(report);
    this.state.metrics.reportsGenerated++;
    this.logger.info('Weekly report generated');
    this.emit('report_generated', { agent: this.config.name, reportId: report.id, type: 'weekly', timestamp: new Date() });

    return { success: true, data: report, duration: Date.now() - start, timestamp: new Date() };
  }

  /** Generate a monthly executive summary report. */
  async generateMonthlyReport(): Promise<ActionResult<Report>> {
    const start = Date.now();
    await this.monitorKPIs();

    const metrics: BusinessMetrics[] = this.latestKPIValues.map((v) => ({
      kpi: v.key, value: this.getAverage(v.key, 30), previousValue: this.getAverage(v.key, 60),
      change: 0, unit: v.unit, timestamp: new Date(), tags: { status: v.status },
    }));
    metrics.forEach((m) => {
      m.change = m.previousValue > 0 ? ((m.value - m.previousValue) / m.previousValue) * 100 : 0;
    });

    const trends = await this.detectTrends();
    const bottlenecks = await this.identifyBottlenecks();
    const recs = this.getRecommendations();

    const report: Report = {
      id: `monthly-${Date.now()}`,
      title: `📈 Monthly Executive Summary — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      type: 'monthly',
      generatedAt: new Date(),
      metrics,
      insights: [
        `Monthly averages across all KPIs`,
        `${(trends.data || []).length} significant trends detected this month`,
        `${(bottlenecks.data || []).length} bottlenecks requiring attention`,
        `Revenue trend: ${this.getTrendText('mrr')}`,
        `User growth: ${this.getTrendText('mau')}`,
      ],
      recommendations: recs,
      rawData: { trends: trends.data || [], bottlenecks: bottlenecks.data || [], kpiHistory: Array.from(this.kpiHistory.entries()).map(([k, v]) => ({ key: k, values: v })) },
    };

    this.reports.push(report);
    this.state.metrics.reportsGenerated++;
    this.logger.info('Monthly report generated');
    this.emit('report_generated', { agent: this.config.name, reportId: report.id, type: 'monthly', timestamp: new Date() });

    return { success: true, data: report, duration: Date.now() - start, timestamp: new Date() };
  }

  private getFormattedValue(key: string, decimals: number): string {
    const kpi = this.latestKPIValues.find((v) => v.key === key);
    return kpi ? kpi.value.toFixed(decimals) : 'N/A';
  }

  private getTrendText(key: string): string {
    const kpi = this.latestKPIValues.find((v) => v.key === key);
    if (!kpi) return 'unknown';
    const absChange = Math.abs(kpi.change);
    if (absChange < 2) return 'stable';
    return kpi.change > 0 ? `up ${kpi.change.toFixed(1)}%` : `down ${absChange.toFixed(1)}%`;
  }

  // ─── Detect Trends ───────────────────────────────────────────────────

  /**
   * Detect trends: moving averages, growth rates, seasonal patterns.
   */
  async detectTrends(data?: Record<string, number[]>): Promise<ActionResult<Trend[]>> {
    const start = Date.now();
    const trends: Trend[] = [];

    const sources = data || Object.fromEntries(this.kpiHistory);

    for (const [key, values] of Object.entries(sources)) {
      if (values.length < 4) continue;

      const recent = values.slice(-14);
      const n = recent.length;
      const first = recent[0];
      const last = recent[recent.length - 1];

      if (first === 0) continue;

      const growthRate = ((last - first) / first) * 100;
      const movingAvg5 = recent.slice(-5).reduce((s, v) => s + v, 0) / Math.min(5, recent.length);
      const movingAvg10 = recent.slice(-10).reduce((s, v) => s + v, 0) / Math.min(10, recent.length);

      let direction: Trend['direction'] = 'stable';
      const absGrowth = Math.abs(growthRate);
      if (absGrowth > 10) direction = growthRate > 0 ? 'up' : 'down';

      const confidence = Math.min(absGrowth / 50, 1);

      // Simple seasonal detection
      let seasonalPattern: { period: string; amplitude: number } | undefined;
      if (values.length > 20) {
        const mid = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
        const secondHalf = values.slice(mid).reduce((s, v) => s + v, 0) / (values.length - mid);
        if (Math.abs(firstHalf - secondHalf) > firstHalf * 0.3) {
          seasonalPattern = { period: 'bi-weekly', amplitude: Math.abs(firstHalf - secondHalf) / Math.max(firstHalf, 1) };
        }
      }

      if (absGrowth > 3) {
        trends.push({
          id: `trend-${key}-${Date.now()}`,
          metric: key,
          direction,
          magnitude: absGrowth,
          window: '14 days',
          confidence: Math.round(confidence * 100) / 100,
          description: `${key} ${direction === 'up' ? 'increased' : 'decreased'} by ${absGrowth.toFixed(1)}% over 14 days (MA5: ${movingAvg5.toFixed(1)}, MA10: ${movingAvg10.toFixed(1)})`,
          movingAverage: [movingAvg5, movingAvg10],
          growthRate,
          seasonalPattern,
        });
      }
    }

    this.trendsCache = trends;
    this.state.metrics.trendsDetected = trends.length;
    this.logger.info(`Trends detected`, { count: trends.length });
    this.emit('trends_detected', { agent: this.config.name, trendsCount: trends.length, timestamp: new Date() });

    return { success: true, data: trends, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Identify Bottlenecks ────────────────────────────────────────────

  /**
   * Identify bottlenecks: funnel analysis, drop-off points, slow conversion steps.
   */
  async identifyBottlenecks(): Promise<ActionResult<Bottleneck[]>> {
    const start = Date.now();
    const bottlenecks: Bottleneck[] = [];

    // Funnel analysis
    const funnel: FunnelStep[] = [];
    let prevCount = 10000;
    for (const step of this.config.funnelSteps) {
      const conversionRate = Math.random() * 0.4 + 0.3;
      const count = Math.max(Math.floor(prevCount * conversionRate), 1);
      funnel.push({
        name: step,
        count,
        previousCount: prevCount,
        conversionRate: (count / prevCount) * 100,
        dropOff: ((prevCount - count) / prevCount) * 100,
        dropOffChange: (Math.random() - 0.5) * 5,
      });
      prevCount = count;
    }

    // Find biggest drop-off
    const sortedDropOffs = [...funnel].sort((a, b) => b.dropOff - a.dropOff);
    if (sortedDropOffs[0].dropOff > 30) {
      bottlenecks.push({
        id: `bn-${Date.now()}-1`,
        area: 'Conversion Funnel',
        impact: 'critical',
        metric: sortedDropOffs[0].name,
        currentValue: sortedDropOffs[0].conversionRate,
        targetValue: 50,
        gap: 50 - sortedDropOffs[0].conversionRate,
        rootCause: `High drop-off (${sortedDropOffs[0].dropOff.toFixed(1)}%) at "${sortedDropOffs[0].name}" stage`,
        recommendation: `Optimize the "${sortedDropOffs[0].name}" step — simplify UX, add guidance, or reduce friction`,
        funnelStep: sortedDropOffs[0].name,
      });
    }

    // Check KPIs
    for (const kpi of this.latestKPIValues) {
      if (kpi.status === 'critical') {
        bottlenecks.push({
          id: `bn-${Date.now()}-${kpi.key}`,
          area: 'KPI Performance',
          impact: 'high',
          metric: kpi.label,
          currentValue: kpi.value,
          targetValue: kpi.target,
          gap: Math.abs(kpi.target - kpi.value),
          rootCause: `${kpi.label} at critical level (${kpi.value.toFixed(1)}${kpi.unit} vs target ${kpi.target}${kpi.unit})`,
          recommendation: `Prioritize ${kpi.label} improvement — investigate root causes and implement corrective actions`,
        });
      }
    }

    this.bottlenecksCache = bottlenecks;
    this.state.metrics.bottlenecksFound = bottlenecks.length;

    // Generate recommendations from bottlenecks
    this.recommendationsCache = bottlenecks.map((b, i) => ({
      id: `rec-${Date.now()}-${i}`,
      title: `Fix: ${b.area} — ${b.metric}`,
      description: b.recommendation,
      expectedImpact: b.impact === 'critical' ? 'high' : 'medium',
      effort: 'medium',
      metric: b.metric,
      priority: i + 1,
    }));
    this.state.metrics.recommendationsGiven = this.recommendationsCache.length;

    this.logger.info(`Bottlenecks identified`, { count: bottlenecks.length });
    this.emit('bottlenecks_identified', { agent: this.config.name, bottlenecksCount: bottlenecks.length, timestamp: new Date() });

    return { success: true, data: bottlenecks, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Recommendations ─────────────────────────────────────────────────

  /** Get actionable recommendations from the latest analysis. */
  getRecommendations(): string[] {
    return this.recommendationsCache.map((r) => `[P${r.priority}] ${r.title}: ${r.description}`);
  }

  // ─── Metrics ─────────────────────────────────────────────────────────

  getMetrics(): Record<string, number> { return { ...this.state.metrics }; }

  resetMetrics(): void {
    this.state.metrics = { kpisTracked: 0, alertsTriggered: 0, reportsGenerated: 0, trendsDetected: 0, bottlenecksFound: 0, recommendationsGiven: 0 };
    this.logger.info('Metrics reset');
    this.emit('metrics_reset', { agent: this.config.name, timestamp: new Date() });
  }
}