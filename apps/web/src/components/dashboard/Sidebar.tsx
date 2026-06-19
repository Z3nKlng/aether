"use client";

import { motion } from "framer-motion";
import { File, Folder, Search, Settings, Terminal, Github, Plus, ChevronRight, FileCode, FileJson, FileType } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
}

const FILES: FileNode[] = [
  { name: "apps", type: "folder", children: [
    { name: "web", type: "folder", children: [
      { name: "src", type: "folder", children: [
        { name: "app", type: "folder", children: [
          { name: "page.tsx", type: "file", language: "tsx" },
          { name: "layout.tsx", type: "file", language: "tsx" },
        ]},
        { name: "components", type: "folder" },
      ]},
      { name: "package.json", type: "file", language: "json" },
    ]},
  ]},
  { name: "packages", type: "folder" },
  { name: "turbo.json", type: "file", language: "json" },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
];

const getFileIcon = (name: string, language?: string) => {
  if (language === "tsx" || name.endsWith(".tsx") || name.endsWith(".ts")) return FileCode;
  if (language === "json" || name.endsWith(".json")) return FileJson;
  return File;
};

const getFileIconColor = (name: string, language?: string) => {
  if (language === "tsx" || name.endsWith(".tsx")) return "text-blue-400";
  if (language === "ts" || name.endsWith(".ts")) return "text-blue-300";
  if (language === "json" || name.endsWith(".json")) return "text-yellow-400";
  return "text-neutral-500";
};

export const Sidebar = () => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["apps", "web", "src"]));

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="w-64 border-r border-white/5 flex flex-col h-full bg-[#0A0A0A] backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between group">
        <span className="font-bold tracking-tighter text-neon-blue text-sm">AETHER IDE</span>
        <button 
          className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Create new file"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
        <div className="space-y-0.5">
          {FILES.map((item, i) => (
            <FileItem 
              key={item.name} 
              item={item} 
              depth={0} 
              path={item.name}
              expandedFolders={expandedFolders}
              onToggle={toggleFolder}
            />
          ))}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between text-neutral-500">
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all" aria-label="Search files">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all" aria-label="Git commands">
            <Github className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all" aria-label="Open terminal">
            <Terminal className="w-4 h-4" />
          </button>
        </div>
        <button className="p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FileItem = ({ 
  item, 
  depth, 
  path, 
  expandedFolders, 
  onToggle 
}: { 
  item: FileNode; 
  depth: number; 
  path: string;
  expandedFolders: Set<string>;
  onToggle: (path: string) => void;
}) => {
  const isExpanded = expandedFolders.has(path);
  const hasChildren = item.children && item.children.length > 0;
  const FileIcon = getFileIcon(item.name, item.language);
  const iconColor = getFileIconColor(item.name, item.language);

  if (item.type === "folder") {
    return (
      <div>
        <button
          onClick={() => onToggle(path)}
          className={cn(
            "flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-sm transition-all duration-150 group",
            "hover:bg-white/[0.04] text-neutral-400 hover:text-neutral-200"
          )}
          style={{ paddingLeft: `${(depth * 12) + 8}px` }}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} folder ${item.name}`}
          aria-expanded={isExpanded}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0"
          >
            <ChevronRight className="w-3 h-3 text-neutral-600" />
          </motion.div>
          <Folder className={cn("w-4 h-4 shrink-0", isExpanded ? "text-blue-400" : "text-blue-400/50")} />
          <span className="truncate">{item.name}</span>
        </button>
        
        {hasChildren && (
          <motion.div
            initial={false}
            animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {item.children!.map((child) => (
              <FileItem
                key={child.name}
                item={child}
                depth={depth + 1}
                path={`${path}/${child.name}`}
                expandedFolders={expandedFolders}
                onToggle={onToggle}
              />
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  // File item
  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-all duration-150 group cursor-pointer",
        "hover:bg-white/[0.04] text-neutral-400 hover:text-white"
      )}
      style={{ paddingLeft: `${(depth * 12) + 24}px` }}
      aria-label={`Open file ${item.name}`}
    >
      <FileIcon className={cn("w-4 h-4 shrink-0", iconColor)} />
      <span className="truncate">{item.name}</span>
    </button>
  );
};