import { builder } from "../builder";

builder.prismaObject("Organization", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    slug: t.exposeString("slug"),
    plan: t.exposeString("plan"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    members: t.relation("members"),
    projects: t.relation("projects"),
  }),
});

builder.prismaObject("Member", {
  fields: (t) => ({
    id: t.exposeID("id"),
    role: t.exposeString("role"),
    user: t.relation("user"),
    organization: t.relation("organization"),
  }),
});

builder.queryFields((t) => ({
  organizations: t.prismaField({
    type: ["Organization"],
    resolve: async (query, _root, _args, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      return ctx.db.organization.findMany({
        ...query,
        where: {
          members: {
            some: {
              userId: ctx.userId,
            },
          },
        },
      });
    },
  }),
  organizationBySlug: t.prismaField({
    type: "Organization",
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { slug }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      return ctx.db.organization.findFirstOrThrow({
        ...query,
        where: {
          slug,
          members: {
            some: {
              userId: ctx.userId,
            },
          },
        },
      });
    },
  }),
}));

builder.mutationFields((t) => ({
  createOrganization: t.prismaField({
    type: "Organization",
    args: {
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { name, slug }, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");
      return ctx.db.organization.create({
        ...query,
        data: {
          name,
          slug,
          members: {
            create: {
              userId: ctx.userId,
              role: "OWNER",
            },
          },
        },
      });
    },
  }),
}));
