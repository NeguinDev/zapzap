"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_next = __toESM(require("next"));
var import_node_http = require("node:http");
var import_node_url = require("node:url");
var import_ws = require("ws");
var import_ws2 = require("@trpc/server/adapters/ws");
var import_context = require("./context");
var import_app = require("./routers/_app");
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = (0, import_next.default)({ dev });
const handle = app.getRequestHandler();
void app.prepare().then(() => {
  const server = (0, import_node_http.createServer)(async (req, res) => {
    if (!req.url)
      return;
    const parsedUrl = (0, import_node_url.parse)(req.url, true);
    await handle(req, res, parsedUrl);
  });
  const wss = new import_ws.WebSocketServer({ server });
  const handler = (0, import_ws2.applyWSSHandler)({ wss, router: import_app.appRouter, createContext: import_context.createContext });
  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
  });
  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
  server.listen(port);
  console.log(
    `> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`
  );
});
