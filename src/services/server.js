import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createReadStream, readFileSync } from "fs";
import { join } from "path";
import { saveFileBase64, deleteFilePath } from "../helpers/files.js";
import { delay } from "../helpers/index.js";
import Bot from "./bot.js";
process.env.TZ = "America/La_Paz";

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.bot = new Bot();

    this.initBot();
    this.middlewares();
    this.routes();
  }

  async initBot() {
    await this.bot.initBot();
  }

  middlewares() {
    this.app.use(express.json({ limit: "80mb" }));
    this.app.use(express.urlencoded({ limit: "80mb", extended: true }));
  }

  routes() {
    this.app.get("/", async (_, res) => {
      const PATH_QR = join(process.cwd(), `bot.qr.png`);
      const fileStream = createReadStream(PATH_QR);
      res.writeHead(200, { "Content-Type": "image/png" });
      fileStream.pipe(res);
    });

    this.app.get("/status", async (_, res) => {
      try {
        const isConnected = this.bot.isConnected();
        const isStarted = this.bot.isStarted();

        res.status(200).json({ isConnected, isStarted });
      } catch (error) {
        res
          .status(500)
          .json({ message: error.message || "Failed to load image" });
      }
    });

    this.app.post("/control", async (req, res) => {
      try {
        const { status } = req.body;
        if (
          !status ||
          ["start", "stop", "restart"].includes(status) === false
        ) {
          res.status(400).json({ error: "Status is required, start or stop" });
        }

        if (status === "start") {
          await this.bot.initBot();
          return res
            .status(200)
            .json({ status: "success", message: "Bot started" });
        }

        if (status === "stop") {
          await this.bot.shutdown();
          return res
            .status(200)
            .json({ status: "success", message: "Bot shutdown" });
        }

        await this.bot.shutdown();
        await this.bot.initBot();
        res.status(200).json({ status: "success", message: "Bot restarted" });
      } catch (error) {
        res
          .status(500)
          .json({ message: error.message || "Failed to shutdown bot" });
      }
    });

    this.app.post("/close-session", async (req, res) => {
      try {
        await this.bot.closeSession();

        return res
          .status(200)
          .json({ status: "success", message: "Bot session closed" });
      } catch (error) {
        res
          .status(500)
          .json({ message: error.message || "Failed to close session bot" });
      }
    });

    this.app.get("/qr", async (_, res) => {
      try {
        const PATH_QR = join(process.cwd(), "bot.qr.png");
        const imageBuffer = readFileSync(PATH_QR);
        const base64Image =
          "data:image/png;base64," + imageBuffer.toString("base64");

        const isConnected = this.bot.isConnected();

        res.status(200).json({ imageBase64: base64Image, isConnected });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to load image" });
      }
    });

    this.app.post("/send-message", async (req, res) => {
      try {
        const { phoneNumber, message, fileBase64, fileName } = req.body;

        let fileUrl;
        if (fileBase64) {
          fileUrl = saveFileBase64(fileBase64, fileName);
        }

        await this.bot.sendMessage(phoneNumber, message, fileUrl);

        if (fileUrl) {
          deleteFilePath(fileUrl);
        }

        res.status(200).json({
          status: "success",
          message: "Mensaje enviado correctamente",
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          status: "error",
          message: error.message || "Error al enviar el mensaje",
        });
      }
    });

    this.app.post("/send-message-list", async (req, res) => {
      try {
        const { list, fileBase64, fileName } = req.body;

        let fileUrl;
        if (fileBase64) {
          fileUrl = saveFileBase64(fileBase64, fileName);
        }

        for (const contact of list) {
          console.log(contact);
          await this.bot.sendMessage(
            contact.phoneNumber,
            contact.message,
            fileUrl,
          );
          await delay(500);
        }

        if (fileUrl) {
          deleteFilePath(fileUrl);
        }

        res.status(200).json({
          status: "success",
          message: "Mensaje enviado correctamente",
        });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ status: "error", message: "Error al enviar el mensaje" });
      }
    });

  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`http://localhost:${this.port} listo!`);
    });
  }
}

export default Server;
