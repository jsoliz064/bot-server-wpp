const BotWhatsapp = require("@bot-whatsapp/bot");
const flow = require("./flow");
const database = require("./database");
const provider = require("./provider");
const { initServer } = require("./express/server");

const main = async () => {
  const botInstance = await BotWhatsapp.createBot({
    database,
    provider,
    flow,
  });

  initServer(botInstance);
};

main();
