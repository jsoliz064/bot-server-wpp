require("dotenv").config();
const express = require("express");
const { createReadStream, readFileSync } = require("fs");
const { join } = require("path");
const { saveFileBase64, deleteFilePath } = require("../helpers/files");
const { delay } = require("../helpers/index");
const Bot = require("./bot");
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

    this.app.get("/qr", async (_, res) => {
      try {
        const PATH_QR = join(process.cwd(), "bot.qr.png");
        const imageBuffer = readFileSync(PATH_QR);
        const base64Image =
          "data:image/png;base64," + imageBuffer.toString("base64");
        res.status(200).json({ imageBase64: base64Image });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to load image" });
      }
    });

    this.app.post("/sendMessage", async (req, res) => {
      try {
        const { phoneNumber, message, fileBase64, fileName } = req.body;

        let fileUrl;
        if (fileBase64) {
          fileUrl = saveFileBase64(fileBase64, fileName);
        }

        await this.sendMessage(phoneNumber, message, fileUrl);

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

    this.app.post("/sendMessageList", async (req, res) => {
      try {
        const { list, fileBase64, fileName } = req.body;

        let fileUrl;
        if (fileBase64) {
          fileUrl = saveFileBase64(fileBase64, fileName);
        }

        for (const contact of list) {
          console.log(contact);
          await this.sendMessage(contact.phoneNumber, contact.message, fileUrl);
          await delay(500);
        }

        if (fileUrl) {
          deleteFilePath(fileUrl);
        }

        res
          .status(200)
          .json({
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

  sendMessage = async (phoneNumber, message, fileUrl) => {
    const id = `${phoneNumber}@s.whatsapp.net`;
    console.log(id);
    let extensionImages = ["png", "jpg", "jpeg", "webp", "gif"];
    let extensionVideos = ["mp4"];

    const bot = this.bot.provider;
    if (fileUrl) {
      const extension = fileUrl.split(".").pop().toLowerCase();
      if (extensionImages.includes(extension)) {
        await bot.sendImage(id, fileUrl, message);
      } else if (extensionVideos.includes(extension)) {
        await bot.sendVideo(id, fileUrl, message);
      } else {
        await bot.sendText(id, message);
        await bot.sendFile(id, fileUrl);
      }
    } else {
      await bot.sendText(id, message);
    }
    console.log(`message send to ${phoneNumber}`);
  };

  listen() {
    this.app.listen(this.port, () => {
      console.log(`http://localhost:${this.port} listo!`);
    });
  }
}

module.exports = Server;
