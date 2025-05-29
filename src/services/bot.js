require("dotenv").config();
const { createBot } = require("@builderbot/bot");
const flow = require("../flow");
const database = require("../database");
const provider = require("../provider");
process.env.TZ = "America/La_Paz";

class Bot {
  constructor() {
    this.provider = null;
  }

  async initBot() {
    const { httpServer } = await createBot({
      flow,
      provider,
      database,
    });

    // botInstance.provider.initVendor();

    httpServer(process.env.PORT + 1);

    this.provider = provider;
  }
}

module.exports = Bot;
