import app from "../src/app";
import { Server } from "http";
import { initSocket } from "../src/config/socket";

let httpServer: Server | null = null;

export default async function handler(req: any, res: any) {
  if (!httpServer) {
    httpServer = new Server(app);
    await initSocket(httpServer);
  }

  return new Promise<void>((resolve) => {
    httpServer!.emit("request", req, res);
    res.on("finish", resolve);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
