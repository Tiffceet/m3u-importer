const list = {
    command: "list",
    description: "list playlists in db",
    builder: (yargs, helpOrVersionSet) => {
        return yargs.option("f", {
            alias: "dbfile",
            describe: "File path to your sqlite db",
            type: "string",
            demandOption: true,
        });
    },
    handler: (argv) => {
        let { dbfile } = argv;
    },
};

export default list;
