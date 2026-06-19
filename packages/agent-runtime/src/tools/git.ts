import { Tool } from '../agent.js';
import { GitIntegrationService, GitHubProvider } from '@aether/git-integration';

export class GitTool implements Tool {
  name = 'git_operation';
  description = 'Perform git operations using integration services (GitHub, etc.)';
  parameters = {
    type: 'object',
    properties: {
      provider: { type: 'string', enum: ['github'], description: 'The git provider' },
      operation: { type: 'string', enum: ['create_pr', 'clone', 'commit', 'push'], description: 'The operation to perform' },
      params: { type: 'object', description: 'Parameters for the operation' },
    },
    required: ['provider', 'operation', 'params'],
  };

  private service: GitIntegrationService;

  constructor(token: string) {
    this.service = new GitIntegrationService();
    this.service.registerProvider('github', new GitHubProvider(token));
  }

  async execute({ provider, operation, params }: { provider: string; operation: string; params: any }): Promise<any> {
    const gitProvider = this.service.getProvider(provider);
    if (!gitProvider) {
      return { error: `Provider ${provider} not found` };
    }

    try {
      switch (operation) {
        case 'create_pr':
          const prUrl = await gitProvider.createPullRequest(params);
          return { prUrl };
        case 'clone':
          await gitProvider.clone(params.repoUrl, params.localPath);
          return { success: true };
        case 'commit':
          await gitProvider.createCommit(params.localPath, params.message);
          return { success: true };
        case 'push':
          await gitProvider.push(params.localPath, params.branch);
          return { success: true };
        default:
          return { error: `Operation ${operation} not supported` };
      }
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
