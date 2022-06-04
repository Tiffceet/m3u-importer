const migrate = {
    command: "migrate",
    description: "migrate .m3u playlist into db",
    builder: (yargs, helpOrVersionSet) => {
        return yargs
            .option("f", {
                alias: "dbfile",
                describe: "File path to your sqlite db",
                type: "string",
                demandOption: true,
            })
            .option("p", {
                alias: "playlistpath",
                describe: "path to m3u playlist; Can be to .m3u file directly or directory name containing the playlists",
                type: "string",
                demandOption: true,
            });
    },
    handler: (argv) => {
        let { dbfile, playlistpath } = argv;
    },
};

export default migrate;
