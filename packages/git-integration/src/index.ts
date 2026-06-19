import { Octokit } from 'octokit';
import { simpleGit, SimpleGit } from 'simple-git';

export interface GitProvider {
  clone(repoUrl: string, localPath: string): Promise<void>;
  createPullRequest(params: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base: string;
  }): Promise<string>;
  createCommit(localPath: string, message: string): Promise<void>;
  push(localPath: string, branch: string): Promise<void>;
}

export class GitHubProvider implements GitProvider {
  private octokit: Octokit;
  private git: SimpleGit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
    this.git = simpleGit();
  }

  async clone(repoUrl: string, localPath: string): Promise<void> {
    await this.git.clone(repoUrl, localPath);
  }

  async createPullRequest(params: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base: string;
  }): Promise<string> {
    const response = await this.octokit.rest.pulls.create({
      owner: params.owner,
      repo: params.repo,
      title: params.title,
      body: params.body,
      head: params.head,
      base: params.base,
    });
    return response.data.html_url;
  }

  async createCommit(localPath: string, message: string): Promise<void> {
    const localGit = simpleGit(localPath);
    await localGit.add('.');
    await localGit.commit(message);
  }

  async push(localPath: string, branch: string): Promise<void> {
    const localGit = simpleGit(localPath);
    await localGit.push('origin', branch);
  }
}

export class GitIntegrationService {
  private providers: Map<string, GitProvider> = new Map();

  registerProvider(name: string, provider: GitProvider) {
    this.providers.set(name, provider);
  }

  getProvider(name: string): GitProvider | undefined {
    return this.providers.get(name);
  }
}
