import sqlite3 from "sqlite3";
import { open } from "sqlite";
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
    handler: async (argv) => {
        let { dbfile } = argv;
        let db = await open({
            filename: dbfile,
            driver: sqlite3.Database,
        });
        let playlist_name = (
            await db.all("SELECT DISTINCT name FROM music_playlist")
        ).map((x) => x.name);
        console.log("Playlists:");
        playlist_name.forEach((value, index) => {
            console.log(`\t${index + 1}. ${value}`);
        });
    },
};

export default list;
