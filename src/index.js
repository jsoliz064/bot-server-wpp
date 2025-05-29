process.env.TZ = "America/La_Paz";

const Server = require("./services/server");

const server=new Server();


server.listen();
