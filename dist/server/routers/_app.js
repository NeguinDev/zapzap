"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var app_exports = {};
__export(app_exports, {
  appRouter: () => appRouter
});
module.exports = __toCommonJS(app_exports);
var import_zod = require("zod");
var import_trpc = require("../trpc");
var import_message = require("./message");
var import_prisma = require("../prisma");
const appRouter = (0, import_trpc.router)({
  healthcheck: import_trpc.publicProcedure.query(() => "ok"),
  message: import_message.messageRouter,
  register: import_trpc.publicProcedure.input(
    import_zod.z.object({
      username: import_zod.z.string(),
      password: import_zod.z.string()
    })
  ).mutation(async ({ input }) => {
    const user = await import_prisma.prisma.user.findUnique({
      where: {
        username: input.username
      }
    });
    if (user) {
      throw new Error("User already exists");
    }
    const newUser = await import_prisma.prisma.user.create({
      data: {
        username: input.username,
        password: input.password
      }
    });
    return newUser;
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  appRouter
});
