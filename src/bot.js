import Discord from "discord.js";
import Parser from "./parser.js";
import _ from "lodash";

module.exports = class Supervizor
{
    constructor(botData) 
    {
        this.client = new Discord.Client();
        this.config = require("./config.js");
        this.registerEvents();

        this.client.login(botData.credentials.token).then(() => {});
    }

    registerEvents()
    {
        this.client.on("ready", () => {
            console.log("Logged in as " + this.client.user.tag);
        });

        this.client.on("message", (bla) => {
            this.channel = bla.channel;

            if (bla.author.bot)
                return;

            this.stop = false;

            try
            {
                var parser = new Parser(this.config.parserConfig);    
                var result = parser.parse(bla.content);
                var find = (what) => {return _.find(result, (value) => {return value.long === what || value.short === what})};
                if (result)
                {
                    var clearTask = find("--clear");
                    if (clearTask)
                    {
                        this.clear(bla.channel, clearTask.value, find("--force") !== undefined)
                        return;
                    }
                    var stop = find("--stop")
                    if (stop)
                    {
                        this.stop = true;
                        return;
                    }
                }
            }
            catch(exc)
            {
                this.say(exc.message);
            }

            const user = bla.author.username;
            const message = bla.content;
            //console.log(user);
            //console.log(message);

            //bla.delete(1000);
        });
    }

    clear(channel, amount, forced)
    {
        if ((amount === undefined || amount <= 0 || amount > 100) && !forced)
            throw {message: "To delete that many entries, you must pass --force."};
        
        if (amount > 0 && amount < 100 && !forced)
        {
            channel.bulkDelete(amount)
                .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                .catch(console.error)
            ;                
        }
        else if (amount > 0)
        {
            const killer = () => 
            {
                try 
                {
                    const min = Math.min(amount, 50);
                    channel.bulkDelete(min).then(messages => {
                        try
                        {
                            amount -= min;
                            if (amount > 0 && this.stop !== true)
                                killer();
                        }
                        catch (err)
                        {
                            this.say(err.message);
                        }
                    }).catch(err => {
                        this.say(err.message);
                    });       
                }
                catch (err)
                {
                    this.say(err.message);
                }
            }
            killer();     
        }
    }

    say(what)
    {
        console.log("say: ");
        console.log(what);
        if (what && what.length > 1)
            this.channel.send(what);
    }
}

