"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FolderOpen,
  Eye,
  Download,
  RefreshCw,
  Terminal as TerminalIcon,
  PanelLeft,
  PanelBottom,
  X,
  Code2,
  Cpu,
  Globe,
  Database,
  Shield,
  Zap,
  ChevronRight,
  Clock,
  Bot,
  User,
  ArrowRight,
  Lightbulb,
  GitBranch,
  Play,
  Copy,
  Check,
} from "lucide-react";
import { GlassCard } from "@aether/ui";
import { NeonButton } from "@aether/ui";

// Types
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

interface BuildStep {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  message?: string;
}

// Sample starter prompts
const STARTER_PROMPTS = [
  { icon: Globe, label: "Landing page", desc: "A modern SaaS landing page with hero, features, pricing" },
  { icon: Database, label: "API backend", desc: "REST API with Express, Prisma, and PostgreSQL" },
  { icon: Cpu, label: "AI chatbot", desc: "Chat interface with streaming responses" },
  { icon: Shield, label: "Auth system", desc: "Full auth with login, signup, and password reset" },
];

// Sample generated code for demo
const generateDemoCode = (prompt: string): ProjectFile[] => {
  const appName = prompt.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20) || "my-app";
  return [
    {
      name: "index.ts",
      path: `src/index.ts`,
      content: `import { serve } from "bun";\n\nconst app = new Bun.Server({\n  port: 3000,\n  async fetch(req) {\n    const url = new URL(req.url);\n    \n    if (url.pathname === "/") {\n      return new Response("Hello from ${appName}!");\n    }\n    \n    if (url.pathname === "/api/health") {\n      return Response.json({ status: "ok", app: "${appName}" });\n    }\n\n    return new Response("Not found", { status: 404 });\n  },\n});\n\nconsole.log(\`Server running on http://localhost:3000\`);\nexport default app;`,
      language: "typescript",
    },
    {
      name: "package.json",
      path: "package.json",
      content: JSON.stringify({
        name: appName,
        version: "0.1.0",
        private: true,
        scripts: { dev: "bun run src/index.ts", build: "bun build src/index.ts" },
        dependencies: { "bun-types": "latest" },
      }, null, 2),
      language: "json",
    },
    {
      name: "README.md",
      path: "README.md",
      content: `# ${appName}\n\nBuilt with Aether AI.\n\n## Getting Started\n\n\`\`\`bash\nbun install\nbun run dev\n\`\`\`\n\n## API\n\n- \`GET /\` - Homepage\n- \`GET /api/health\` - Health check\n`,
      language: "markdown",
    },
  ];
};

const generateBuildSteps = (): BuildStep[] => [
  { id: "analyze", label: "Analyzing requirements", status: "pending" },
  { id: "architect", label: "Designing architecture", status: "pending" },
  { id: "generate", label: "Generating code", status: "pending" },
  { id: "test", label: "Running tests", status: "pending" },
  { id: "deploy", label: "Preparing deployment", status: "pending" },
];

export default function IDEPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "files" | "preview" | "terminal">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [prompt]);

  const runBuildSteps = async () => {
    const steps = generateBuildSteps();
    setBuildSteps(steps);
    setGeneratedFiles([]);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setBuildSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "running" as const } : s
      ));
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      setBuildSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "success" as const } : s
      ));
    }

    // Generate files after build completes
    const files = generateDemoCode(prompt);
    setGeneratedFiles(files);
    if (files.length > 0) setSelectedFile(files[0].name);
    setActiveView("files");
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setPrompt("");

    // Start build steps
    runBuildSteps();

    // Simulate AI response
    await new Promise(r => setTimeout(r, 2000));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `I've analyzed your request and built a complete project for **${prompt.slice(0, 50)}**. Here's what I created:\n\n- 📁 Project scaffold with Bun runtime\n- 🔧 TypeScript configuration\n- 📝 API endpoints and routes\n- 🚀 Ready to deploy\n\nYou can view the generated files in the file explorer, or ask me to make changes.`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyFile = (name: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const selectedFileData = generatedFiles.find(f => f.name === selectedFile);

  return (
    <div className="flex-1 flex h-full min-w-0 relative bg-[#0A0A0A]">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden shrink-0 border-r border-white/5"
      >
        {isSidebarOpen && (
          <div className="w-80 h-full flex flex-col bg-[#0C0C0C]">
            {/* View Tabs */}
            <div className="flex border-b border-white/5">
              {[
                { id: "chat" as const, label: "Chat", icon: Bot },
                { id: "files" as const, label: "Files", icon: FileCode },
                { id: "preview" as const, label: "Preview", icon: Eye },
                { id: "terminal" as const, label: "Terminal", icon: TerminalIcon },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    activeView === tab.id
                      ? "text-white bg-white/5 border-b-2 border-neon-blue"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chat View */}
            {activeView === "chat" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && !isGenerating && (
                    <div className="space-y-6 pt-4">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-6 h-6 text-neon-blue" />
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-1">What do you want to build?</h2>
                        <p className="text-sm text-neutral-500">Describe your app and I&apos;ll build it for you.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {STARTER_PROMPTS.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => setPrompt(item.desc)}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all text-left group"
                          >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                              <item.icon className="w-4 h-4 text-neon-blue" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">{item.label}</p>
                              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{item.desc}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors shrink-0 mt-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-purple-600 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                          <div className={`rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-neon-blue/10 border border-neon-blue/20 text-white"
                              : "bg-white/5 border border-white/5 text-neutral-200"
                          }`}>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : ""}`}>
                            <span className="text-[10px] text-neutral-600">
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-purple-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                          Building your project...
                        </div>
                        {/* Build Steps */}
                        <div className="mt-3 space-y-1.5">
                          {buildSteps.map(step => (
                            <div key={step.id} className="flex items-center gap-2 text-xs">
                              {step.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border border-neutral-700" />}
                              {step.status === "running" && <Loader2 className="w-3.5 h-3.5 animate-spin text-neon-blue" />}
                              {step.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                              {step.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                              <span className={
                                step.status === "success" ? "text-emerald-400" :
                                step.status === "running" ? "text-neon-blue" :
                                step.status === "error" ? "text-red-400" :
                                "text-neutral-600"
                              }>{step.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Prompt Input */}
                <div className="p-4 border-t border-white/5">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe what you want to build..."
                      rows={1}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 resize-none transition-all"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!prompt.trim() || isGenerating}
                      className="absolute right-2 bottom-2 p-2 rounded-lg bg-neon-blue hover:bg-neon-blue/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-600 mt-2 text-center">
                    Press Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </div>
            )}

            {/* Files View */}
            {activeView === "files" && (
              <div className="flex-1 overflow-y-auto p-4">
                {generatedFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500">No files generated yet</p>
                    <p className="text-xs text-neutral-600 mt-1">Describe a project to get started</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {generatedFiles.map(file => (
                      <button
                        key={file.name}
                        onClick={() => setSelectedFile(file.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedFile === file.name
                            ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                            : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <FileCode className="w-4 h-4 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] text-neutral-600 ml-auto">{file.language}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preview View */}
            {activeView === "preview" && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <Globe className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">Preview coming soon</p>
                  <p className="text-xs text-neutral-600 mt-1">Deploy your project to see it live</p>
                  <NeonButton variant="ghost" size="sm" className="mt-4" disabled>
                    <Play className="w-4 h-4" />
                    Deploy Preview
                  </NeonButton>
                </div>
              </div>
            )}

            {/* Terminal View */}
            {activeView === "terminal" && (
              <div className="flex-1 p-4 font-mono text-xs">
                <div className="space-y-1 text-green-400/80">
                  <div>$ aether init</div>
                  <div className="text-neutral-500">Initializing project...</div>
                  {generatedFiles.length > 0 && (
                    <>
                      <div className="text-emerald-400">✓ Project created</div>
                      <div>$ bun install</div>
                      <div className="text-neutral-500">Installing dependencies...</div>
                      <div className="text-emerald-400">✓ Dependencies installed</div>
                      <div>$ bun run dev</div>
                      <div className="text-emerald-400 animate-pulse">Server running on http://localhost:3000</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-neutral-900/80 border border-white/5 rounded-r-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <PanelLeft className="w-3 h-3 text-neutral-500" />
        </motion.div>
      </button>

      {/* Main Content - Code Viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFileData ? (
          <>
            {/* File Tab */}
            <div className="h-10 border-b border-white/5 flex bg-[#0A0A0A]">
              <div className="px-4 flex items-center gap-2 border-r border-white/5 bg-white/[0.03] text-xs text-white relative">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedFileData.name}</span>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-blue" />
              </div>
              <div className="flex-1" />
              <button
                onClick={() => handleCopyFile(selectedFileData.name, selectedFileData.content)}
                className="px-3 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                {copiedFile === selectedFileData.name ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedFile === selectedFileData.name ? "Copied" : "Copy"}
              </button>
            </div>
            {/* Code Display */}
            <div className="flex-1 overflow-auto bg-[#0D0D0D] p-6">
              <pre className="text-sm font-mono leading-relaxed">
                <code className="text-neutral-300">
                  {selectedFileData.content.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-neutral-700 w-10 text-right mr-4 select-none shrink-0">{i + 1}</span>
                      <span className="whitespace-pre">{line || " "}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Code2 className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Development</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Describe what you want to build in natural language, and Aether will generate the entire project — from architecture to code to deployment.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-600">
                <Zap className="w-3.5 h-3.5" />
                <span>Powered by autonomous AI agents</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}