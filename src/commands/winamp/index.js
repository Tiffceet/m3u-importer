import * as Commands from "./commands/index.js";
const winamp = {
    command: "winamp",
    description: "winamp related utils function",
    builder: (yargs, helpOrVersionSet) => {
        yargs = yargs.usage("Usage: $0 winamp <command>");
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

export default winamp;
