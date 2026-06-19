import "./user";
import "./organization";
import "./project";
import "./deployment";
import "./task";
import { builder } from "../builder";

export const schema = builder.toSchema();
