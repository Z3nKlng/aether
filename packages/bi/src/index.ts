export type MetricValue = number | string | boolean;

export interface Metric {
  name: string;
  value: MetricValue;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  data: any;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface Trend {
  name: string;
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  dataPoints: number[];
}

export interface Anomaly {
  metricName: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export class MetricsCollector {
  private metrics: Metric[] = [];

  collect(metric: Metric): void {
    this.metrics.push(metric);
  }

  getMetrics(filter?: (m: Metric) => boolean): Metric[] {
    return filter ? this.metrics.filter(filter) : this.metrics;
  }

  aggregate(name: string, type: 'avg' | 'sum' | 'max' | 'min'): number {
    const values = this.metrics
      .filter(m => m.name === name && typeof m.value === 'number')
      .map(m => m.value as number);
    
    if (values.length === 0) return 0;

    switch (type) {
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'max': return Math.max(...values);
      case 'min': return Math.min(...values);
    }
  }
}

export class ReportGenerator {
  generate(metrics: Metric[], period: 'daily' | 'weekly' | 'monthly'): Report {
    return {
      id: `rep-${Math.random().toString(36).substr(2, 9)}`,
      title: `${period.charAt(0).toUpperCase() + period.slice(1)} Performance Report`,
      generatedAt: new Date(),
      period,
      data: metrics, // Simplified
    };
  }
}

export class TrendAnalyzer {
  analyze(dataPoints: number[]): Trend {
    if (dataPoints.length < 2) {
      return { name: 'Unknown', direction: 'neutral', percentage: 0, dataPoints };
    }
    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    const percentage = ((last - first) / first) * 100;
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';

    return {
      name: 'Metric Trend',
      direction,
      percentage: Math.abs(percentage),
      dataPoints
    };
  }

  detectAnomalies(metrics: Metric[]): Anomaly[] {
    // Basic threshold-based anomaly detection mock
    return [];
  }
}

export class DataExporter {
  exportToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }

  exportToJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  exportToPDF(data: any): string {
    return "PDF Export not implemented in browser environment";
  }
}
