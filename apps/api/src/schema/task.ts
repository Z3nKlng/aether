import { builder } from "../builder";

builder.prismaObject("Task", {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description", { nullable: true }),
    status: t.exposeString("status"),
    project: t.relation("project"),
    agent: t.relation("agent", { nullable: true }),
    result: t.exposeString("result", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("CollaborationSession", {
  fields: (t) => ({
    id: t.exposeID("id"),
    project: t.relation("project"),
    users: t.relation("users"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.queryFields((t) => ({
  tasks: t.prismaField({
    type: ["Task"],
    args: {
      projectId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { projectId }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      return ctx.db.task.findMany({
        ...query,
        where: {
          projectId,
          project: {
            organization: {
              members: { some: { userId: ctx.userId } },
            },
          },
        },
      });
    },
  }),
}));

builder.mutationFields((t) => ({
  createTask: t.prismaField({
    type: "Task",
    args: {
      projectId: t.arg.string({ required: true }),
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      agentId: t.arg.string({ required: false }),
    },
    resolve: async (query, _root, { projectId, title, description, agentId }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      return ctx.db.task.create({
        ...query,
        data: {
          title,
          description,
          projectId,
          agentId: agentId || undefined,
        },
      });
    },
  }),
}));
