import dotenv from "dotenv";
dotenv.config();

import { createBot } from "@builderbot/bot";
import flow from "../flow/index.js";
import database from "../database/index.js";
import provider from "../provider/index.js";
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

export default Bot;
