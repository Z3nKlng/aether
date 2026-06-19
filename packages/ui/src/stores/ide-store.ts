import { create } from "zustand";

interface FileItem {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
}

interface IDEState {
  activeFile: string | null;
  openFiles: string[];
  terminalLogs: string[];
  isCommandPaletteOpen: boolean;
  
  setActiveFile: (filename: string) => void;
  openFile: (filename: string) => void;
  closeFile: (filename: string) => void;
  addTerminalLog: (log: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useIDEStore = create<IDEState>((set) => ({
  activeFile: "index.ts",
  openFiles: ["index.ts", "package.json"],
  terminalLogs: [
    "aether@sandbox:~$ pnpm install",
    "Scope: all 16 workspace projects",
    "Lockfile is up to date, resolution step is skipped",
    "Already up to date",
  ],
  isCommandPaletteOpen: false,

  setActiveFile: (filename) => set({ activeFile: filename }),
  openFile: (filename) => set((state) => ({
    openFiles: state.openFiles.includes(filename) ? state.openFiles : [...state.openFiles, filename],
    activeFile: filename
  })),
  closeFile: (filename) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f !== filename);
    return {
      openFiles: newOpenFiles,
      activeFile: state.activeFile === filename ? (newOpenFiles[0] || null) : state.activeFile
    };
  }),
  addTerminalLog: (log) => set((state) => ({ terminalLogs: [...state.terminalLogs, log] })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
}));
