import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { prisma } from "@aether/database";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    userId?: string;
    db: typeof prisma;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: any;
      Output: any;
    };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});

builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("JSON", JSONResolver, {});

builder.queryType({});
builder.mutationType({});
// builder.subscriptionType({}); // If we add subscriptions later
