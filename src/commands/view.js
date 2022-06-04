import sqlite3 from "sqlite3";
import { open } from "sqlite";
const view = {
    command: "view <dbfile>",
    description: "View details about the backup db",
    builder: (yargs, helpOrVersionSet) => {
        return yargs.positional("dbfile", {
            describe: "File path to your sqlite db",
            type: "string",
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
        console.log("Playlist count: " + playlist_name.length);
        console.log("Playlist(s):");
        playlist_name.forEach((value, index) => {
            console.log(`\t${index + 1}. ${value}`);
        });

        if (playlist_name.length > 0) {
            let paths = await db.all("SELECT path FROM music_playlist");
            paths = Object.keys(
                paths.reduce((prev, cur, idx) => {
                    cur = cur.path;
                    let path = cur.slice(0, cur.lastIndexOf("/") + 1);
                    if (!prev[path]) {
                        prev[path] = true;
                    }
                    return prev;
                }, {})
            );
            console.log("Existing path(s):");
            paths.forEach((v, i) => {
                console.log(`\t${i + 1}. ${v}`);
            });
        }
    },
};

export default view;
