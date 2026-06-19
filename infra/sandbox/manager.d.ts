export declare class SandboxManager {
    private docker;
    constructor();
    createSandbox(image?: string): Promise<any>;
    executeCommand(containerId: string, cmd: string[]): Promise<unknown>;
    terminateSandbox(containerId: string): Promise<void>;
}
//# sourceMappingURL=manager.d.ts.map