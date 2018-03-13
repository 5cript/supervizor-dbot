import Supervizor from "./bot.js"
import fs from "fs"

try 
{
    const fileContent = fs.readFileSync("resources/bot_data.json");
    var botData = JSON.parse(fileContent);
    var supervizor = new Supervizor(botData);
}
catch (exc)
{
    console.log(exc.message);
}

