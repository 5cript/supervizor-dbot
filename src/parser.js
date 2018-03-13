const _ = require("lodash")

module.exports = class CommandParser
{
    constructor(parserConfig)
    {
        this.parserConfig = parserConfig;
        this.args = [];

        this.addArgument({
            short: "-c",
            long: "--clear",
            expect_value: "optional",
            value_validator: (what) => {
                if (+what === +what)
                    return Number.isInteger(+what);
                return false;
            }
        });

        this.addArgument({
            short: "-f",
            long: "--force"
        });

        this.addArgument({
            short: "-s",
            long: "--stop"
        });
    }

    addArgument(arg)
    {
        this.args.push(arg);
    }

    parse(message)
    {
        this.actual = [];

        const prefixes = this.parserConfig.prefixes.join("");
        if (!message.startsWith(prefixes))
            return; // not a supervizor command

        message = message.slice(prefixes.length);
        console.log("Message: " + message);

        var args = message.split(" ");
        args.shift();
        while (args.length > 0)
            args = this.consume(args);

        return this.actual;
    }

    consume(args)
    {
        var result = _.find(this.args, (value) => {
            return args[0] === value.short || args[0] === value.long
        });

        if (!result)
            throw {message: "Unrecognized Parameter: " + args[0]};
        else
        {
            var retrieveValue = () => {
                if (args.length < 2)
                    throw {message: "Parameter requires value: " + args[0]};
                result.value = args[1];
                if (!result.value_validator(result.value))
                    throw {message: "Unexpected value: " + result.value};
                args.shift();
            };
            if (result.expect_value === true)
            {                
                retrieveValue();
            }   
            else if (result.expect_value === "optional")
            {
                if (args.length >= 2 && args[1].length > 0 && 
                    _.find(this.args, (value) => {
                        return args[1] === value.short || args[1] === value.long
                    }) == undefined
                ){
                    retrieveValue();
                }
            }
            this.actual.push(result);
        }

        args.shift();
        return args;
    }
}