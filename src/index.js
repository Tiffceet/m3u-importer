#!/usr/bin/env node
import * as Commands from "./commands/index.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

let yargs_obj = yargs(hideBin(process.argv)).usage("Usage: $0 <command>");

Object.keys(Commands).forEach((command_name) => {
    const command = Commands[command_name];
    yargs_obj = yargs_obj.command(
        command.command,
        command.description,
        command.builder,
        command.handler
    );
});
yargs_obj.demandCommand(1).parse();
