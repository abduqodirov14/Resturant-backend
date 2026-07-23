import { createServer } from "http";
import app from "./app";
import { initSocket } from "./config/socket";

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

initSocket(httpServer)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Socket.io init failed:", err);
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without Socket.io)`);
    });
  });
