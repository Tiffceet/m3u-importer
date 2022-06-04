const remove = {
    command: "remove",
    description: "remove all playlist from db",
    builder: (yargs, helpOrVersionSet) => {
        return yargs
            .option("f", {
                alias: "dbfile",
                describe: "File path to your sqlite db",
                type: "string",
                demandOption: true,
            })
            .option("n", {
                alias: "playlistname",
                describe:
                    "Name of playlist to remove. If given, will only remove playlist of this name",
                type: "string",
                demandOption: false,
            });
    },
    handler: (argv) => {
        let { dbfile, playlistname } = argv;
    },
};

export default remove;
