import { prisma } from '@aether/database';

interface SandboxInfo {
  id: string;
}

interface SandboxManagerInterface {
  createSandbox(image?: string): Promise<SandboxInfo>;
  executeCommand(containerId: string, cmd: string[]): Promise<string>;
  terminateSandbox(containerId: string): Promise<void>;
}

export class DeploymentRuntime {
  private sandboxManager: SandboxManagerInterface;

  constructor(sandboxManager?: SandboxManagerInterface) {
    // Use a simple sandbox stub that logs instead of actually using Docker
    this.sandboxManager = sandboxManager || {
      createSandbox: async (_image?: string) => {
        console.log('[Sandbox] Creating sandbox with image:', _image);
        return { id: 'stub-' + Math.random().toString(36).slice(2) };
      },
      executeCommand: async (_containerId: string, cmd: string[]) => {
        console.log('[Sandbox] Executing command:', cmd.join(' '));
        return `[Simulated] Running: ${cmd.join(' ')}`;
      },
      terminateSandbox: async (_containerId: string) => {
        console.log('[Sandbox] Terminating:', _containerId);
      },
    };
  }

  async deploy(deploymentId: string) {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { project: true },
    });

    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    try {
      await this.updateStatus(deploymentId, 'BUILDING', 'Starting build process...');

      // 1. Create a sandbox for the build
      const sandbox = await this.sandboxManager.createSandbox('node:22-alpine');
      const containerId = sandbox.id;

      try {
        // 2. Setup build environment (simulated: in a real app we'd clone the repo here)
        await this.appendLog(deploymentId, 'Cloning repository...');

        // 3. Install dependencies
        await this.appendLog(deploymentId, 'Installing dependencies...');
        const installOutput = await this.sandboxManager.executeCommand(containerId, ['npm', 'install']);
        await this.appendLog(deploymentId, installOutput);

        // 4. Build the project
        await this.appendLog(deploymentId, 'Building project...');
        const buildOutput = await this.sandboxManager.executeCommand(containerId, ['npm', 'run', 'build']);
        await this.appendLog(deploymentId, buildOutput);

        // 5. Deploy to "edge" (simulated: upload to S3/CloudFront)
        await this.updateStatus(deploymentId, 'DEPLOYING', 'Deploying to edge nodes...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 6. Success
        const finalUrl = `https://${deployment.project.slug}.aether.app`;
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: {
            status: 'SUCCESS',
            url: finalUrl,
            logs: deployment.logs + '\nDeployment successful!'
          },
        });

        // Simulate domain assignment
        console.log(`Assigned custom domain: ${finalUrl}`);

      } finally {
        // Always cleanup the sandbox
        await this.sandboxManager.terminateSandbox(containerId);
      }

    } catch (error: any) {
      console.error(`Deployment ${deploymentId} failed:`, error);
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'FAILED',
          logs: (deployment.logs || '') + `\nError: ${error.message}`
        },
      });
    }
  }

  private async updateStatus(deploymentId: string, status: any, message: string) {
    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status,
        logs: (deployment?.logs || '') + `\n[${status}] ${message}`
      },
    });
  }

  private async appendLog(deploymentId: string, log: string) {
    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        logs: (deployment?.logs || '') + `\n${log}`
      },
    });
  }
}