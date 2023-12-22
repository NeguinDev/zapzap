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
var message_exports = {};
__export(message_exports, {
  messageRouter: () => messageRouter
});
module.exports = __toCommonJS(message_exports);
var import_observable = require("@trpc/server/observable");
var import_events = require("events");
var import_prisma = require("../prisma");
var import_zod = require("zod");
var import_trpc = require("../trpc");
class MyEventEmitter extends import_events.EventEmitter {
}
const ee = new MyEventEmitter();
function getLastMessage({ fromId, toId }) {
  return import_prisma.prisma.message.findFirst({
    where: {
      OR: [
        {
          fromId,
          toId
        },
        {
          fromId: toId,
          toId: fromId
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
const messageRouter = (0, import_trpc.router)({
  me: import_trpc.authedProcedure.query(({ ctx }) => {
    return import_prisma.prisma.user.findUnique({
      where: {
        id: ctx.user.id
      }
    });
  }),
  users: import_trpc.authedProcedure.mutation(async ({ ctx }) => {
    const users = await import_prisma.prisma.user.findMany({
      select: {
        id: true,
        username: true
      },
      where: {
        id: {
          not: ctx.user.id
        }
      }
    });
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await getLastMessage({
          fromId: user.id,
          toId: ctx.user.id
        });
        return {
          ...user,
          lastMessage
        };
      })
    );
    return usersWithLastMessage;
  }),
  getLastMessage: import_trpc.authedProcedure.input(
    import_zod.z.object({
      userId: import_zod.z.string()
    })
  ).subscription(async ({ ctx: { user }, input }) => {
    return import_prisma.prisma.message.findFirst({
      where: {
        OR: [
          {
            fromId: input.userId,
            toId: user.id
          },
          {
            fromId: user.id,
            toId: input.userId
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }),
  messages: import_trpc.authedProcedure.input(
    import_zod.z.object({
      userId: import_zod.z.string()
    })
  ).mutation(async ({ input, ctx: { user } }) => {
    return import_prisma.prisma.message.findMany({
      where: {
        OR: [
          {
            fromId: input.userId,
            toId: user.id
          },
          {
            fromId: user.id,
            toId: input.userId
          }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }),
  send: import_trpc.authedProcedure.input(
    import_zod.z.object({
      text: import_zod.z.string().min(1),
      userId: import_zod.z.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const message = await import_prisma.prisma.message.create({
      data: {
        text: input.text,
        from: {
          connect: {
            id: ctx.user.id
          }
        },
        to: {
          connect: {
            id: input.userId
          }
        }
      }
    });
    ee.emit("message", message);
    return message;
  }),
  onMessage: import_trpc.authedProcedure.subscription(({ ctx }) => {
    return (0, import_observable.observable)((emit) => {
      const onAdd = (data) => {
        if (data.toId === ctx?.user?.id) {
          emit.next(data);
        }
      };
      ee.on("message", onAdd);
      return () => {
        ee.off("message", onAdd);
      };
    });
  }),
  onUserStatus: import_trpc.publicProcedure.subscription(() => {
    return (0, import_observable.observable)((emit) => {
      const onAdd = (data) => {
        emit.next(data);
      };
      ee.on("userStatus", onAdd);
      return () => {
        ee.off("userStatus", onAdd);
      };
    });
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  messageRouter
});
