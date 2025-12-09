import dotenv from "dotenv";
dotenv.config();

process.env.TZ = "America/La_Paz";

import Server from "./services/server.js";

const server=new Server();


server.listen();
