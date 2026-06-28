// Auto-generated stub — generated at build time from GraphQL schema
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: string;
  url?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  status: string;
  type: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Member {
  id: string;
  userId: string;
  role: string;
  user: User;
}

export class AetherClient {
  endpoint: string;
  
  constructor(opts: { endpoint?: string; token?: string }) {
    this.endpoint = opts.endpoint || 'http://localhost:4000/graphql';
  }

  async getProjects(): Promise<Project[]> { return []; }
  async getProject(id: string): Promise<Project | null> { return null; }
  async createProject(name: string, description?: string): Promise<Project> { return { id: 'new', name, description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
  async getDeployments(projectId: string): Promise<Deployment[]> { return []; }
  async createDeployment(projectId: string): Promise<Deployment> { return { id: 'new', projectId, status: 'created', createdAt: new Date().toISOString() }; }
  async getAgents(): Promise<Agent[]> { return []; }
  async getUser(): Promise<User | null> { return null; }
  async getOrganization(slug: string): Promise<Organization | null> { return null; }
  async getMembers(orgId: string): Promise<Member[]> { return []; }
}

export const createClient = (opts: { endpoint?: string; token?: string }) => new AetherClient(opts);
