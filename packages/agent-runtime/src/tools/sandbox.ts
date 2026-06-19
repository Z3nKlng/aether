import { Tool } from '../agent.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ShellTool implements Tool {
  name = 'execute_command';
  description = 'Execute a bash command in the sandbox environment. Returns stdout and stderr.';
  parameters = {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The bash command to execute',
      },
      cwd: {
        type: 'string',
        description: 'The working directory to execute the command in',
      },
    },
    required: ['command'],
  };

  async execute({ command, cwd }: { command: string; cwd?: string }): Promise<any> {
    try {
      console.log(`Executing command: ${command} in ${cwd || 'default cwd'}`);
      const { stdout, stderr } = await execAsync(command, { cwd });
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
      };
    }
  }
}

export class FileReadTool implements Tool {
  name = 'read_file';
  description = 'Read the contents of a file from the sandbox.';
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'The absolute path to the file',
      },
    },
    required: ['path'],
  };

  async execute({ path }: { path: string }): Promise<any> {
    try {
      const { stdout } = await execAsync(`cat ${path}`);
      return { content: stdout };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

export class FileWriteTool implements Tool {
  name = 'write_file';
  description = 'Write content to a file in the sandbox.';
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'The absolute path to the file',
      },
      content: {
        type: 'string',
        description: 'The content to write',
      },
    },
    required: ['path', 'content'],
  };

  async execute({ path, content }: { path: string; content: string }): Promise<any> {
    try {
      // Use a safer way to write files if possible, but for now:
      // Note: we should use fs.writeFile but exec is easier for simple implementation here
      const fs = await import('fs/promises');
      const pathModule = await import('path');
      await fs.mkdir(pathModule.dirname(path), { recursive: true });
      await fs.writeFile(path, content, 'utf8');
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
