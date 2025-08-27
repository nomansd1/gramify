import { createServer } from "http";
import app from "./app.js";
import { PORT } from "./utils/constants.js";
import { intiSocket } from "./utils/socket.js";

const server = createServer(app);
intiSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});