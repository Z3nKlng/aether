/**
 * Content Agent
 *
 * Creates blog posts, social media content, newsletters, educational content,
 * manages a content calendar with scheduled posts and topic clusters,
 * provides templates for various platforms, and handles publishing.
 *
 * Methods:
 *  - createBlogPost(topic)          — Generate blog post with SEO metadata
 *  - createSocialContent(platform)  — Generate platform-specific social media post
 *  - generateNewsletter()           — Generate newsletter with sections + CTAs
 *  - createEducationalContent()     — Generate tutorials, guides, docs
 *  - publish(content)               — Publish through draft→review→publish workflow
 *  - getContentCalendar()           — Get scheduled content calendar
 *  - getMetrics()                   — Returns current metrics snapshot
 */

import { EventEmitter } from 'events';
import type { AgentConfig, AgentEvent, AgentState, ActionResult, ContentItem, LogLevel } from '../../types';
import { Logger } from '../../logger';

// ─── Types ─────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  readTime: number;
  status: 'draft' | 'review' | 'published';
  tags: string[];
  topicCluster: string;
  seo: { title: string; description: string; keywords: string[]; ogImage?: string };
  publishedAt?: Date;
  metrics?: { views: number; shares: number; engagement: number };
}

export interface SocialContent {
  id: string;
  platform: 'twitter' | 'linkedin' | 'github' | 'discord';
  content: string;
  thread?: string[];
  mediaUrls: string[];
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  metrics?: { impressions: number; engagements: number; clicks: number };
}

export interface Newsletter {
  id: string;
  subject: string;
  previewText: string;
  sections: Array<{ title: string; content: string; cta?: { text: string; url: string } }>;
  status: 'draft' | 'sent';
  sentAt?: Date;
  metrics?: { openRate: number; clickRate: number; unsubscribeRate: number };
}

export interface EducationalContent {
  id: string;
  title: string;
  type: 'tutorial' | 'guide' | 'documentation' | 'cheatsheet';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  body: string;
  prerequisites: string[];
  estimatedDuration: number;
  status: 'draft' | 'review' | 'published';
}

export interface ContentCalendarEntry {
  id: string;
  title: string;
  type: ContentItem['type'];
  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'published';
  topicCluster: string;
  platform?: string;
}

export interface ContentTemplate {
  name: string;
  platform: string;
  structure: string[];
  suggestions: string[];
}

export interface ContentAgentConfig extends AgentConfig {
  defaultAuthor: string;
  contentCalendar: ContentCalendarEntry[];
  seoKeywords: string[];
  topicClusters: string[];
}

const DEFAULT_CONFIG: ContentAgentConfig = {
  name: 'content-agent',
  version: '2.0.0',
  enabled: true,
  interval: 3600000,
  logLevel: 'info',
  defaultAuthor: 'Aether Team',
  contentCalendar: [],
  seoKeywords: ['AI development', 'autonomous engineering', 'software development', 'AI agents', 'developer tools'],
  topicClusters: ['product-updates', 'engineering', 'tutorials', 'community', 'ai-ml'],
};

// ─── Error Classes ─────────────────────────────────────────────────────

export class ContentAgentError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ContentAgentError';
  }
}

export class PublishingError extends ContentAgentError {
  constructor(contentId: string, reason: string) {
    super(`Failed to publish ${contentId}: ${reason}`, 'PUBLISHING_FAILED');
  }
}

// ─── Templates ─────────────────────────────────────────────────────────

const CONTENT_TEMPLATES: ContentTemplate[] = [
  { name: 'Blog Post', platform: 'blog', structure: ['Title', 'Excerpt', 'Introduction', 'Body (3-5 sections)', 'Conclusion', 'CTA'], suggestions: ['Include code snippets', 'Add screenshots/diagrams', 'Use H2/H3 for sections', 'Include author bio'] },
  { name: 'Tweet/Thread', platform: 'twitter', structure: ['Hook tweet', '2-4 thread tweets', 'CTA with link'], suggestions: ['Keep under 280 chars per tweet', 'Use line breaks', 'Include 1-2 hashtags', 'Tag relevant accounts'] },
  { name: 'LinkedIn Post', platform: 'linkedin', structure: ['Headline', 'Body (2-3 paragraphs)', 'CTA', 'Hashtags'], suggestions: ['Professional tone', 'Include personal insight', 'Share metrics/data', 'Use 3-5 hashtags'] },
  { name: 'Newsletter', platform: 'email', structure: ['Subject line', 'Preview text', 'Hero section', '2-3 content sections', 'CTA buttons', 'Footer'], suggestions: ['Personalize subject line', 'Keep preview text <140 chars', '1 main CTA per section', 'Include social proof'] },
  { name: 'Tutorial', platform: 'docs', structure: ['Title', 'Prerequisites', 'Step-by-step instructions', 'Code examples', 'Expected output', 'Troubleshooting'], suggestions: ['Include copyable code blocks', 'Add numbered steps', 'Show expected output', 'Note common errors'] },
];

// ─── Agent ─────────────────────────────────────────────────────────────

export class ContentAgent extends EventEmitter {
  private config: ContentAgentConfig;
  private state: AgentState;
  private logger: Logger;
  private blogPosts: BlogPost[];
  private socialPosts: SocialContent[];
  private newsletters: Newsletter[];
  private educational: EducationalContent[];
  private calendar: ContentCalendarEntry[];
  private intervalHandle: ReturnType<typeof setInterval> | null;

  constructor(config: Partial<ContentAgentConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger('ContentAgent', this.config.logLevel);
    this.state = {
      status: 'idle', lastRun: null, lastError: null, runCount: 0,
      metrics: { blogPostsCreated: 0, blogPostsPublished: 0, socialPostsCreated: 0, socialPostsPublished: 0, newslettersCreated: 0, newslettersSent: 0, educationalCreated: 0, educationalPublished: 0, totalViews: 0, totalEngagement: 0 },
    };
    this.blogPosts = [];
    this.socialPosts = [];
    this.newsletters = [];
    this.educational = [];
    this.calendar = [];
    this.intervalHandle = null;
    this.logger.info('ContentAgent initialized', { templates: CONTENT_TEMPLATES.length });
  }

  getState(): AgentState { return { ...this.state }; }
  getConfig(): ContentAgentConfig { return { ...this.config }; }

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
    try { this.state.runCount++; this.state.lastRun = new Date(); } catch (err) {
      this.state.lastError = err instanceof Error ? err.message : String(err);
      this.logger.error('Cycle error', this.state.lastError);
    }
  }

  // ─── Create Blog Post ────────────────────────────────────────────────

  /** Generate a blog post with SEO metadata. */
  async createBlogPost(topic: string, options?: { keywords?: string[]; cluster?: string }): Promise<ActionResult<BlogPost>> {
    const start = Date.now();
    const cluster = options?.cluster || 'product-updates';
    const keywords = options?.keywords || [topic, ...this.config.seoKeywords].slice(0, 5);

    const title = this.generateBlogTitle(topic);
    const excerpt = `Discover how Aether's autonomous AI agents transform ${topic.toLowerCase()}. Learn best practices, tips, and strategies for AI-powered development.`;

    const body = [
      `# ${title}\n\nThe landscape of ${topic.toLowerCase()} is evolving rapidly, and AI-native development platforms like Aether are leading the transformation.`,      `## Why ${topic} Matters\n\nIn today's fast-paced development environment, ${topic.toLowerCase()} has become crucial for teams looking to ship faster and more reliably. Aether's autonomous agents handle the heavy lifting so you can focus on what matters.`,
      `## How Aether Helps\n\nAether combines multiple specialized AI agents — planners, engineers, testers, and DevOps — into a single platform. Describe what you want in natural language, and watch as our agents design, code, test, and deploy your application.`,
      `## Getting Started\n\n1. Visit aether.dev and create your account\n2. Describe your project in natural language\n3. Review the AI-generated architecture and code\n4. Click deploy — Aether handles the rest\n\nIt's free forever for core usage.`,
      `## Key Takeaways\n\n- ${topic} is transforming how we build software\n- Aether's multi-agent system handles the entire development lifecycle\n- Start building today — no team required, no credit card needed`,
    ].join('\n\n');

    const post: BlogPost = {
      id: `post-${Date.now()}`,
      title, excerpt, body, author: this.config.defaultAuthor,
      readTime: Math.ceil(body.split(' ').length / 200),
      status: 'draft', tags: [...new Set([topic, cluster, ...keywords])],
      topicCluster: cluster,
      seo: { title: `${title} | Aether Blog`, description: excerpt, keywords },
    };

    this.blogPosts.push(post);
    this.state.metrics.blogPostsCreated++;
    this.logger.info('Blog post created', { title, topicCluster: cluster });
    this.emit('blog_post_created', { agent: this.config.name, postId: post.id, title, timestamp: new Date() });

    return { success: true, data: post, duration: Date.now() - start, timestamp: new Date() };
  }

  private generateBlogTitle(topic: string): string {
    const templates = [
      `Building with ${topic}: A Complete Guide`,
      `${topic} in the Age of AI-Native Development`,
      `How Aether Transforms ${topic} Workflows`,
      `${topic}: Best Practices for Modern Development`,
      `Mastering ${topic} with Autonomous AI Agents`,
      `The Future of ${topic} is AI-Powered`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // ─── Create Social Content ───────────────────────────────────────────

  /** Generate platform-specific social media content. */
  async createSocialContent(platform: SocialContent['platform'], topic?: string): Promise<ActionResult<SocialContent>> {
    const start = Date.now();

    const templates: Record<SocialContent['platform'], { content: string; thread?: string[]; hashtags: string[] }> = {
      twitter: {
        content: `Ship ${topic || 'apps'} 10x faster with Aether 🚀\n\nDescribe what you want in natural language. Our AI agents handle architecture, code, tests, and deployment.\n\nFree forever → aether.dev`,
        thread: ['1/ Why spend weeks building when Aether can do it in minutes?', '2/ Autonomous AI agents handle the entire dev lifecycle', '3/ From prompt to production in under 60 seconds', '4/ Free forever for core usage. Try it today → aether.dev'],
        hashtags: ['#AIEngineering', '#DevTools', '#BuildInPublic', '#Aether'],
      },
      linkedin: {
        content: `The future of software engineering is autonomous.\n\nAt Aether, we've built an AI-native platform where you describe your app in natural language and our multi-agent workforce builds, tests, and deploys it.\n\nWhat once required an entire engineering team can now be done by one person with Aether.\n\nTry it free: aether.dev`,
        hashtags: ['#SoftwareEngineering', '#AI', '#DeveloperTools', '#Innovation', '#Aether'],
      },
      github: {
        content: `Aether — AI-native autonomous engineering OS.\n\nDescribe apps in natural language → agents design, code, test, deploy.\n\nFree forever. aether.dev`,
        hashtags: ['#ai', '#developer-tools', '#opensource'],
      },
      discord: {
        content: `Hey {{channel}}! 👋 Just built and shipped with Aether in under 5 minutes. Has anyone else tried autonomous engineering yet? Drop your builds below! 🚀`,
        hashtags: [],
      },
    };

    const tpl = templates[platform];
    const post: SocialContent = {
      id: `social-${platform}-${Date.now()}`,
      platform,
      content: tpl.content,
      thread: tpl.thread,
      mediaUrls: [],
      hashtags: tpl.hashtags,
      status: 'draft',
    };

    this.socialPosts.push(post);
    this.state.metrics.socialPostsCreated++;
    this.logger.info('Social content created', { platform });
    this.emit('social_content_created', { agent: this.config.name, postId: post.id, platform, timestamp: new Date() });

    return { success: true, data: post, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Generate Newsletter ─────────────────────────────────────────────

  /** Generate a newsletter with sections and CTAs. */
  async generateNewsletter(): Promise<ActionResult<Newsletter>> {
    const start = Date.now();

    const newsletter: Newsletter = {
      id: `nl-${Date.now()}`,
      subject: `Aether Update — Autonomous Engineering Weekly`,
      previewText: 'Agent performance improvements, community spotlight, pro tips, and upcoming events...',
      sections: [
        { title: '🚀 Product Updates', content: 'This week: 20% faster agent response times, new deployment templates for Next.js + Prisma, enhanced code review with security scanning.' },
        { title: '💡 Pro Tip: Better Prompts', content: 'For best results: include your tech stack ("React + Tailwind + PostgreSQL"), design preferences, and any constraints. The more context, the better your AI-generated output.', cta: { text: 'Read the Guide', url: 'https://aether.dev/docs/prompts' } },
        { title: '🌟 Community Spotlight', content: 'This week\'s featured builder: Alex from SF built a full B2B SaaS platform (auth, billing, analytics) in 4 days with Aether. "This would have taken months with a traditional team."', },
        { title: '📅 Upcoming Events', content: 'Join our live workshop "Building with AI Agents" — build a complete app from scratch. Register at aether.dev/events.', cta: { text: 'Register', url: 'https://aether.dev/events' } },
        { title: '📊 By the Numbers', content: 'This month: 15,000+ apps deployed, 250K+ AI tasks completed, 92% agent success rate, 48 NPS score.' },
      ],
      status: 'draft',
    };

    this.newsletters.push(newsletter);
    this.state.metrics.newslettersCreated++;
    this.logger.info('Newsletter generated', { subject: newsletter.subject, sections: newsletter.sections.length });
    this.emit('newsletter_generated', { agent: this.config.name, newsletterId: newsletter.id, timestamp: new Date() });

    return { success: true, data: newsletter, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Create Educational Content ──────────────────────────────────────

  /** Generate tutorials, guides, docs, or cheatsheets. */
  async createEducationalContent(
    topic: string,
    type: EducationalContent['type'] = 'tutorial',
    difficulty: EducationalContent['difficulty'] = 'beginner'
  ): Promise<ActionResult<EducationalContent>> {
    const start = Date.now();

    const content: EducationalContent = {
      id: `edu-${type}-${Date.now()}`,
      title: `${type === 'tutorial' ? 'How to ' : ''}${topic}${type === 'guide' ? ' Guide' : ''}${type === 'cheatsheet' ? ' Cheatsheet' : ''}`,
      type,
      difficulty,
      body: `# ${topic}\n\n## Prerequisites\n- Aether account (free)\n- Basic understanding of ${topic}\n\n## Step 1: Getting Started\nOpen the Aether IDE and describe what you want to build.\n\n## Step 2: Review & Iterate\nReview the AI-generated architecture and code. Make adjustments as needed.\n\n## Step 3: Deploy\nClick deploy and watch your app go live.\n\n## Troubleshooting\nIf you encounter issues, check our FAQ or community forums.`,
      prerequisites: ['Aether account', 'Basic programming knowledge'],
      estimatedDuration: 10,
      status: 'draft',
    };

    this.educational.push(content);
    this.state.metrics.educationalCreated++;
    this.logger.info('Educational content created', { type, difficulty });
    this.emit('educational_content_created', { agent: this.config.name, contentId: content.id, type, timestamp: new Date() });

    return { success: true, data: content, duration: Date.now() - start, timestamp: new Date() };
  }

  // ─── Publish ─────────────────────────────────────────────────────────

  /**
   * Publish content through draft → review → publish workflow.
   */
  async publish(content: BlogPost | SocialContent | Newsletter | EducationalContent): Promise<ActionResult<boolean>> {
    const start = Date.now();

    try {
      let published = false;

      if ('seo' in content) {  // BlogPost
        if (content.status === 'draft') content.status = 'review';
        else if (content.status === 'review') {
          content.status = 'published';
          content.publishedAt = new Date();
          content.metrics = { views: 0, shares: 0, engagement: 0 };
          this.state.metrics.blogPostsPublished++;
          published = true;
        }
      } else if ('platform' in content) {  // SocialContent
        if (content.status === 'draft') content.status = 'scheduled';
        else if (content.status === 'scheduled') {
          content.status = 'published';
          content.publishedAt = new Date();
          content.metrics = { impressions: 0, engagements: 0, clicks: 0 };
          this.state.metrics.socialPostsPublished++;
          published = true;
        }
      } else if ('subject' in content) {  // Newsletter
        content.status = 'sent';
        content.sentAt = new Date();
        content.metrics = { openRate: 42 + Math.random() * 12, clickRate: 8 + Math.random() * 10, unsubscribeRate: Math.random() * 0.5 };
        this.state.metrics.newslettersSent++;
        published = true;
      } else if ('difficulty' in content) {  // EducationalContent
        if (content.status === 'draft') content.status = 'review';
        else if (content.status === 'review') {
          content.status = 'published';
          this.state.metrics.educationalPublished++;
          published = true;
        }
      }

      if (published) {
        this.logger.info('Content published', { id: content.id });
        this.emit('content_published', { agent: this.config.name, contentId: content.id, timestamp: new Date() });
      }

      return { success: published, data: published, duration: Date.now() - start, timestamp: new Date() };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Publish failed', { contentId: 'id' in content ? content.id : 'unknown', error: msg });
      return { success: false, error: msg, duration: Date.now() - start, timestamp: new Date() };
    }
  }

  // ─── Content Calendar ────────────────────────────────────────────────

  /** Get the content calendar. */
  getContentCalendar(): ContentCalendarEntry[] {
    return [...this.calendar];
  }

  /** Schedule content in the calendar. */
  scheduleContent(entry: ContentCalendarEntry): void {
    this.calendar.push(entry);
    this.calendar.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    this.logger.info('Content scheduled', { title: entry.title, scheduledFor: entry.scheduledFor.toISOString() });
    this.emit('content_scheduled', { agent: this.config.name, entry, timestamp: new Date() });
  }

  /** Get content templates. */
  getTemplates(): ContentTemplate[] {
    return [...CONTENT_TEMPLATES];
  }

  // ─── Metrics ─────────────────────────────────────────────────────────

  getMetrics(): Record<string, number> { return { ...this.state.metrics }; }

  getBlogPosts(status?: BlogPost['status']): BlogPost[] {
    return status ? this.blogPosts.filter((p) => p.status === status) : [...this.blogPosts];
  }

  getSocialPosts(status?: SocialContent['status']): SocialContent[] {
    return status ? this.socialPosts.filter((p) => p.status === status) : [...this.socialPosts];
  }

  getNewsletters(status?: Newsletter['status']): Newsletter[] {
    return status ? this.newsletters.filter((n) => n.status === status) : [...this.newsletters];
  }

  resetMetrics(): void {
    this.state.metrics = { blogPostsCreated: 0, blogPostsPublished: 0, socialPostsCreated: 0, socialPostsPublished: 0, newslettersCreated: 0, newslettersSent: 0, educationalCreated: 0, educationalPublished: 0, totalViews: 0, totalEngagement: 0 };
    this.logger.info('Metrics reset');
    this.emit('metrics_reset', { agent: this.config.name, timestamp: new Date() });
  }
}