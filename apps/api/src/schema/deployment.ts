import { builder } from "../builder";

builder.prismaObject("Deployment", {
  fields: (t) => ({
    id: t.exposeID("id"),
    status: t.exposeString("status"),
    url: t.exposeString("url", { nullable: true }),
    logs: t.exposeString("logs", { nullable: true }),
    project: t.relation("project"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.queryFields((t) => ({
  deployments: t.prismaField({
    type: ["Deployment"],
    args: {
      projectId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { projectId }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      
      // Check permission
      const project = await ctx.db.project.findFirst({
        where: {
          id: projectId,
          organization: {
            members: {
              some: {
                userId: ctx.userId,
              },
            },
          },
        },
      });

      if (!project) throw new Error("Forbidden");

      return ctx.db.deployment.findMany({
        ...query,
        where: {
          projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
  }),
}));

builder.mutationFields((t) => ({
  triggerDeployment: t.prismaField({
    type: "Deployment",
    args: {
      projectId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { projectId }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");

      const project = await ctx.db.project.findFirst({
        where: {
          id: projectId,
          organization: {
            members: {
              some: {
                userId: ctx.userId,
                role: {
                  in: ["OWNER", "ADMIN", "MEMBER"],
                },
              },
            },
          },
        },
      });

      if (!project) throw new Error("Forbidden");

      return ctx.db.deployment.create({
        ...query,
        data: {
          projectId,
          status: "QUEUED",
        },
      });
    },
  }),
}));
