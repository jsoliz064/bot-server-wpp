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
    this.serverInstance = null;
  }

  async initBot() {
    console.log("--- Iniciando bot ---");

    if (this.provider) return;

    const { httpServer } = await createBot({
      flow,
      provider,
      database,
    });

    this.provider = provider;
    this.serverInstance = httpServer(process.env.PORT + 1);
  }

  async shutdown() {
    console.log("--- Apagando bot ---");

    if (this.serverInstance && this.serverInstance.close) {
      await new Promise((resolve) => this.serverInstance.close(resolve));
    }

    if (this.provider && this.provider.vendor) {
      try {
        this.provider.vendor.ev.removeAllListeners();
        // if (this.provider.vendor.logout) await this.provider.vendor.logout();
      } catch (e) {
        console.log("Error al desconectar vendor:", e.message);
      }
    }

    this.provider = null;
    this.serverInstance = null;
  }

  isConnected() {
    const session = this.provider?.vendor?.user ?? null;
    return session ? true : false;
  }

  isStarted() {
    return this.provider !== null && this.serverInstance !== null;
  }

  sendMessage = async (phoneNumber, message, fileUrl) => {
    if (!this.isConnected()) {
      throw new Error(
        "WhatsApp desconectado. Reintentando conexión, por favor espere unos segundos.",
      );
    }

    const id = `${phoneNumber}@s.whatsapp.net`;
    let extensionImages = ["png", "jpg", "jpeg", "webp", "gif"];
    let extensionVideos = ["mp4"];

    if (fileUrl) {
      const extension = fileUrl.split(".").pop().toLowerCase();
      if (extensionImages.includes(extension)) {
        await this.provider.sendImage(id, fileUrl, message);
      } else if (extensionVideos.includes(extension)) {
        await this.provider.sendVideo(id, fileUrl, message);
      } else {
        await this.provider.sendText(id, message);
        await this.provider.sendFile(id, fileUrl);
      }
    } else {
      await this.provider.sendText(id, message);
    }
    console.log(`message send to ${phoneNumber}`);
  };

  closeSession = async () => {
    console.log("--- Cerrando sesión bot ---");
    if (!this.isStarted()) {
      throw new Error("Bot apagado. Reinicie el bot.");
    }
    if (!this.isConnected()) return;
    await this.provider.vendor.logout();
  };
}

export default Bot;
