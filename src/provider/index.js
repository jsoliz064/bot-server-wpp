import { createProvider } from "@builderbot/bot";
// import { BaileysProvider } from "@builderbot/provider-baileys";
import { SherpaProvider } from "@builderbot/provider-sherpa";

export default createProvider(SherpaProvider, {
  // usePairingCode: true,
  // phoneNumber: "59162691938",
  version: [2, 3000, 1027934701],
  // browser: ["Windows", "Chrome", "Chrome 114.0.5735.198"],
});
