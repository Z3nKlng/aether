"use client";

import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Rocket, Plus, ExternalLink, Calendar, GitBranch } from "lucide-react";
import Link from "next/link";

const mockProjects = [
  { id: "1", name: "E-Commerce App", slug: "ecommerce-app", updatedAt: new Date().toISOString(), deployments: [{ status: "live", url: "https://ecommerce-app.vercel.app" }] },
  { id: "2", name: "API Dashboard", slug: "api-dashboard", updatedAt: new Date().toISOString(), deployments: [{ status: "preview", url: "https://api-dashboard.vercel.app" }] },
  { id: "3", name: "Mobile Backend", slug: "mobile-backend", updatedAt: new Date().toISOString(), deployments: [{ status: "building", url: "" }] },
];

export default function ProjectsPage() {
  const api = useApi();

  // Use Query will fetch from real API when ready
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // For now, return mock data or try to fetch
      try {
        // @ts-ignore
        const result = await api.query({
          projects: {
            id: true,
            name: true,
            slug: true,
            updatedAt: true,
            deployments: {
              status: true,
              url: true,
            }
          }
        });
        return result.projects;
      } catch (e) {
        console.error("API Error", e);
        return mockProjects;
      }
    },
    initialData: mockProjects,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-neutral-400">Manage your Aether-powered applications.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,174,255,0.5)] transition-all">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-blue/50 hover:bg-white/[0.07] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-neon-blue/10 rounded-xl group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-neon-blue" />
              </div>
              <Link 
                href={`/dashboard/projects/${project.slug}`}
                className="p-2 text-neutral-500 hover:text-white transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>

            <h3 className="text-xl font-bold mb-1">{project.name}</h3>
            <p className="text-sm text-neutral-500 mb-6 font-mono">{project.slug}.aether.app</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <Calendar className="w-4 h-4" />
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <GitBranch className="w-4 h-4" />
                main branch
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Production</span>
              </div>
              <Link 
                href={`/dashboard/ide?project=${project.id}`}
                className="text-xs font-bold text-neon-blue hover:underline"
              >
                Open in IDE →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
