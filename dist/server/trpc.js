"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var trpc_exports = {};
__export(trpc_exports, {
  authedProcedure: () => authedProcedure,
  mergeRouters: () => mergeRouters,
  middleware: () => middleware,
  publicProcedure: () => publicProcedure,
  router: () => router
});
module.exports = __toCommonJS(trpc_exports);
var import_server = require("@trpc/server");
var superjson = __toESM(require("superjson"));
var import_prisma = require("./prisma");
const t = import_server.initTRPC.context().create({
  /**
   * @see https://trpc.io/docs/v10/data-transformers
   */
  transformer: superjson.default,
  /**
   * @see https://trpc.io/docs/v10/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  }
});
const router = t.router;
const publicProcedure = t.procedure;
const middleware = t.middleware;
const mergeRouters = t.mergeRouters;
const isAuthed = middleware(async ({ next, ctx }) => {
  const session = ctx.session?.user;
  if (!session?.name) {
    throw new import_server.TRPCError({ code: "UNAUTHORIZED", message: "Unauthorizedaaaaaaaaaaaaaaaaaaaaaaaaaa" });
  }
  const user = await import_prisma.prisma.user.findUnique({
    where: {
      username: session.name
    }
  });
  return next({
    ctx: {
      user: {
        id: user?.id,
        username: user?.username
      }
    }
  });
});
const authedProcedure = t.procedure.use(isAuthed);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authedProcedure,
  mergeRouters,
  middleware,
  publicProcedure,
  router
});
