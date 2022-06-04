import sqlite3 from "sqlite3";
import { open } from "sqlite";
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
    handler: async (argv) => {
        let { dbfile, playlistname } = argv;
        let db = await open({
            filename: dbfile,
            driver: sqlite3.Database,
        });

        await db.run("DELETE FROM music_playlist WHERE name = ?", playlistname);

        console.log(`Successfully deleted '${playlistname}' from db`);
    },
};

export default remove;
