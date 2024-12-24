const express = require("express");
const {
  createReadStream,
  writeFileSync,
  unlinkSync,
  readFileSync,
} = require("fs");
const { join } = require("path");
const app = express();
app.use(express.json({ limit: "80mb" }));
app.use(express.urlencoded({ limit: "80mb", extended: true }));

const PORT = process.env.PORT || 3000;

const initServer = async (botInstance) => {
  app.post("/sendMessage", async (req, res) => {
    try {
      const { phoneNumber, message, fileBase64, fileName } = req.body;

      let fileUrl;
      if (fileBase64) {
        fileUrl = saveFileBase64(fileBase64, fileName);
      }

      await sendMessage(phoneNumber, message, fileUrl);

      if (fileUrl) {
        deleteFilePath(fileUrl);
      }

      console.log(`message send to ${phoneNumber}`);
      res
        .status(200)
        .json({ status: "success", message: "Mensaje enviado correctamente" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "error", message: "Error al enviar el mensaje" });
    }
  });

  app.post("/sendMessageList", async (req, res) => {
    try {
      const { list, fileBase64, fileName } = req.body;

      let fileUrl;
      if (fileBase64) {
        fileUrl = saveFileBase64(fileBase64, fileName);
      }

      for (const contact of list) {
        console.log(contact);
        await sendMessage(contact.phoneNumber, contact.message, fileUrl);
        await delay(500);
      }

      if (fileUrl) {
        deleteFilePath(fileUrl);
      }

      res
        .status(200)
        .json({ status: "success", message: "Mensaje enviado correctamente" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "error", message: "Error al enviar el mensaje" });
    }
  });

  const saveFileBase64 = (fileBase64, fileName) => {
    const extension = getExtensionByBase64(fileBase64);
    const base64Data = fileBase64.replace(
      /^data:[a-zA-Z0-9]+\/[a-zA-Z0-9.-]+;base64,/,
      ""
    );

    fileName = fileName ?? Date.now();

    let file_url = join(
      process.cwd(),
      "/uploads/files",
      `${fileName}.${extension}`
    );
    writeFileSync(file_url, base64Data, "base64");
    file_url = file_url.replace(/\\/g, "/");
    console.log(`File saved on: ${file_url}`);
    return file_url;
  };

  const deleteFilePath = (filePath) => {
    unlinkSync(filePath);
    console.log(`Archivo eliminado: ${filePath}`);
  };

  const getExtensionByBase64 = (fileBase64) => {
    const matches = fileBase64.match(
      /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9.-]+);base64,/
    );

    if (!matches || matches.length !== 2) {
      throw new Error("Invalid file format");
    }

    const mimeType = matches[1];
    const extension = mimeType.split("/")[1];
    return extension;
  };

  const sendMessage = async (phoneNumber, message, fileUrl) => {
    const id = `${phoneNumber}@s.whatsapp.net`;
    let extensionImages = ["png", "jpg", "jpeg", "webp", "gif"];
    let extensionVideos = ["mp4"];
    const bot = botInstance.providerClass;
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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  app.get("/qr", async (_, res) => {
    const PATH_QR = join(process.cwd(), `bot.qr.png`);
    const fileStream = createReadStream(PATH_QR);
    res.writeHead(200, { "Content-Type": "image/png" });
    fileStream.pipe(res);
  });

  app.get("/qr-base64", async (_, res) => {
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

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} listo!`);
  });
};

module.exports = { initServer };
