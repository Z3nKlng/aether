"use client";

import { Editor as MonacoEditor, type BeforeMount } from "@monaco-editor/react";
import { useRef } from "react";

const AETHER_THEME = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "6A9955", fontStyle: "italic" },
    { token: "keyword", foreground: "00AEFF", fontStyle: "bold" },
    { token: "string", foreground: "CE9178" },
    { token: "number", foreground: "B5CEA8" },
    { token: "type", foreground: "4EC9B0" },
    { token: "function", foreground: "DCDCAA" },
    { token: "variable", foreground: "9CDCFE" },
    { token: "constant", foreground: "4FC1FF" },
    { token: "tag", foreground: "569CD6" },
    { token: "attribute", foreground: "9CDCFE" },
    { token: "delimiter", foreground: "808080" },
  ],
  colors: {
    "editor.background": "#0A0A0A",
    "editor.foreground": "#D4D4D4",
    "editor.lineHighlightBackground": "#1A1A1A",
    "editor.selectionBackground": "#00AEFF30",
    "editor.inactiveSelectionBackground": "#00AEFF20",
    "editorCursor.foreground": "#00AEFF",
    "editorWhitespace.foreground": "#333333",
    "editorIndentGuide.background": "#1E1E1E",
    "editorIndentGuide.activeBackground": "#333333",
    "editorLineNumber.foreground": "#666666",
    "editorLineNumber.activeForeground": "#00AEFF",
    "editorBracketMatch.background": "#00AEFF20",
    "editorBracketMatch.border": "#00AEFF",
    "editorWidget.background": "#0A0A0A",
    "editorWidget.border": "#1A1A1A",
    "minimap.background": "#0A0A0A",
  },
};

export const Editor = () => {
  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("aether-dark", AETHER_THEME);
  };

  return (
    <div className="flex-1 h-full bg-[#0A0A0A]">
      <MonacoEditor
        height="100%"
        defaultLanguage="typescript"
        defaultValue={`// Welcome to Aether IDE
// Your AI workforce is ready

interface AetherProject {
  name: string;
  status: "building" | "deployed" | "failed";
  agents: AIAgent[];
}

function aether() {
  const project: AetherProject = {
    name: "my-app",
    status: "building",
    agents: [],
  };
  
  console.log("Building the future...");
  return project;
}

export default aether;
`}
        theme="aether-dark"
        beforeMount={handleBeforeMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, monospace",
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: "all",
          lineHeight: 24,
          letterSpacing: 0.2,
        }}
      />
    </div>
  );
};