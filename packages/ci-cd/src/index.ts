import { Orchestrator } from '@aether/agent-runtime';
import { GitIntegrationService } from '@aether/git-integration';

export class CICDService {
  private orchestrator: Orchestrator;
  private gitService: GitIntegrationService;

  constructor(orchestrator: Orchestrator, gitService: GitIntegrationService) {
    this.orchestrator = orchestrator;
    this.gitService = gitService;
  }

  async handleGitEvent(event: { type: 'push' | 'pull_request'; repoUrl: string; branch: string; data: any }) {
    console.log(`Handling git event: ${event.type} on ${event.repoUrl}:${event.branch}`);

    if (event.type === 'pull_request') {
      // Trigger code review task
      await this.orchestrator.createTask({
        title: `AI Code Review for PR in ${event.repoUrl}`,
        description: `Review the changes in branch ${event.branch}. Diff: ${event.data.diff || 'N/A'}`,
        assignedTo: 'agent-reviewer',
      });
    } else if (event.type === 'push') {
      // Trigger test and deploy tasks
      const testTask = await this.orchestrator.createTask({
        title: `Run Tests for ${event.repoUrl}`,
        description: `Run unit and integration tests for branch ${event.branch}`,
        assignedTo: 'agent-tester',
      });

      await this.orchestrator.createTask({
        title: `Deploy ${event.repoUrl}`,
        description: `Deploy branch ${event.branch} to production`,
        assignedTo: 'agent-devops',
        dependencies: [testTask.id],
      });
    }
  }
}
