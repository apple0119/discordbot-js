const dotenv = require("dotenv");
dotenv.config();
const { Client, Collection, REST, Routes, messageLink } = require("discord.js");
const client = (module.exports = new Client({ intents: [131071] }));
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
client.login(process.env.TOKEN);
const fs = require("fs");
const eventsPath = "./events";
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));
const mongoose = require("mongoose");

for (const file of eventFiles) {
  const filePath = `./${eventsPath}/${file}`;
  const event = require(filePath);
  if (event.once == true) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.commands = new Collection();
const commands_json = [];
const commandsCategoryPath = "./commands";
const commandsCategoryFiles = fs.readdirSync(commandsCategoryPath);

for (const category of commandsCategoryFiles) {
  const commandsPath = `./commands/${category}`;
  const commandsFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandsFiles) {
    const command = require(`./commands/${category}/${file}`);
    client.commands.set(command.data.name, command);
    commands_json.push(command.data.toJSON());
  }
}

rest
  .put(Routes.applicationCommands(process.env.ID), { body: commands_json })
  .then((command) => console.log(`[DJS14] loaded ${command.length} commands`))
  .catch(console.error);

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGOURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(console.log("[MongoDB] connected DataBase"));

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] reconnected DataBase");
});

mongoose.connection.on("disconnected", () => {
  console.log("[MongoDB] disconnected DataBase");
});

