import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
export class SandboxManager {
    docker;
    constructor() {
        this.docker = new Docker();
    }
    async createSandbox(image = 'node:22-slim') {
        const container = await this.docker.createContainer({
            Image: image,
            Cmd: ['sleep', 'infinity'],
            HostConfig: {
                Memory: 512 * 1024 * 1024, // 512MB
                CpuQuota: 50000, // 0.5 CPU
                NetworkMode: 'none', // Isolation
            },
            Labels: {
                'aether.sandbox': 'true',
                'aether.sandbox.id': uuidv4(),
            },
        });
        await container.start();
        return container;
    }
    async executeCommand(containerId, cmd) {
        const container = this.docker.getContainer(containerId);
        const exec = await container.exec({
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
        });
        const stream = await exec.start({});
        return new Promise((resolve, reject) => {
            let output = '';
            stream.on('data', (chunk) => {
                output += chunk.toString();
            });
            stream.on('end', () => {
                resolve(output);
            });
            stream.on('error', reject);
        });
    }
    async terminateSandbox(containerId) {
        const container = this.docker.getContainer(containerId);
        await container.stop();
        await container.remove();
    }
}
