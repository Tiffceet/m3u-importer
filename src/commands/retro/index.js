import * as Commands from "./commands/index.js";
const retro = {
    command: "retro",
    description: "util functions for Retro Music Player",
    builder: (yargs, helpOrVersionSet) => {
        yargs = yargs.usage("Usage: $0 retro <command>");
        Object.keys(Commands).forEach((command_name) => {
            const command = Commands[command_name];
            yargs = yargs.command(
                command.command,
                command.description,
                command.builder,
                command.handler
            );
        });
        yargs.demandCommand(1);
        return yargs;
    },
};

export default retro;
