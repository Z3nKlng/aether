import { builder } from "../builder";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name", { nullable: true }),
    email: t.exposeString("email", { nullable: true }),
    image: t.exposeString("image", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    memberships: t.relation("memberships"),
  }),
});

builder.queryFields((t) => ({
  me: t.prismaField({
    type: "User",
    nullable: true,
    resolve: async (query, _root, _args, ctx) => {
      if (!ctx.userId) return null;
      return ctx.db.user.findUniqueOrThrow({
        ...query,
        where: { id: ctx.userId },
      });
    },
  }),
}));
