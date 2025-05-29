const { createProvider } = require("@builderbot/bot");
const { BaileysProvider } = require("@builderbot/provider-baileys");

module.exports = createProvider(BaileysProvider, {
  version: [2, 3000, 1023223821],
});
