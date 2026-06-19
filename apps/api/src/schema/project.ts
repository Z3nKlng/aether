import { builder } from "../builder";

builder.prismaObject("Project", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    slug: t.exposeString("slug"),
    organization: t.relation("organization"),
    deployments: t.relation("deployments"),
    agents: t.relation("agents"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Agent", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    role: t.exposeString("role"),
    config: t.expose("config", { type: "JSON" as any }),
    project: t.relation("project"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.queryFields((t) => ({
  project: t.prismaField({
    type: "Project",
    args: {
      organizationSlug: t.arg.string({ required: true }),
      projectSlug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { organizationSlug, projectSlug }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      return ctx.db.project.findFirstOrThrow({
        ...query,
        where: {
          slug: projectSlug,
          organization: {
            slug: organizationSlug,
            members: {
              some: {
                userId: ctx.userId,
              },
            },
          },
        },
      });
    },
  }),
}));

builder.mutationFields((t) => ({
  createProject: t.prismaField({
    type: "Project",
    args: {
      organizationId: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { organizationId, name, slug }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      
      // Check if user has permission to create project in this org
      const membership = await ctx.db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: ctx.userId,
            organizationId,
          },
        },
      });

      if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
        throw new Error("Forbidden");
      }

      return ctx.db.project.create({
        ...query,
        data: {
          name,
          slug,
          organizationId,
        },
      });
    },
  }),
}));
