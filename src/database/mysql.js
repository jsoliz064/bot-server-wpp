const MysqlAdapter = require("@bot-whatsapp/database/mysql");
module.exports = new MysqlAdapter({
  host: "localhost",
  user: "root",
  database: "bot",
  password: "",
});
