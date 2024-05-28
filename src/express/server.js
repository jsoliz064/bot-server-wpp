const express = require("express");
const { createReadStream } = require("fs");
const { join } = require("path");
const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = process.env.PORT || 3000;
const LAMOTICO_HOST = process.env.LAMOTICO_HOST || "http://localhost";

const initServer = (botInstance) => {
  app.post("/sendMessage", async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      const id = `591${phoneNumber}@s.whatsapp.net`;

      const bot = botInstance.providerClass;
      await bot.sendText(id, message);
      console.log(`Mensaje enviado a: ${phoneNumber}, mensaje: ${message}`);

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

  app.get("/qr", async (_, res) => {
    const PATH_QR = join(process.cwd(), `bot.qr.png`);
    const fileStream = createReadStream(PATH_QR);
    res.writeHead(200, { "Content-Type": "image/png" });
    fileStream.pipe(res);
  });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://locahost:${PORT}`);
  });
};

module.exports = { initServer };
