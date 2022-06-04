import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as fs from "fs";
const generate = {
    command: "generate",
    description: "Generate blank db file with preset template",
    builder: (yargs, helpOrVersionSet) => {
        return yargs.option("n", {
            alias: "name",
            describe: "playlist name",
            type: "string",
            demandOption: false,
        });
    },
    handler: async (argv) => {
        let { name: playlist_name } = argv;
        if (!playlist_name) {
            playlist_name = "new_playlist";
        }
        const schema = `CREATE TABLE "music_playlist" (
            "_id"	INTEGER,
            "name"	TEXT NOT NULL,
            "path"	TEXT,
            "album_pic"	TEXT,
            PRIMARY KEY("_id" AUTOINCREMENT)
        );`;

        let new_file_name = `${playlist_name}.db`;
        let dupe_count = 1;
        while (fs.existsSync(`./${new_file_name}`)) {
            new_file_name = `${playlist_name}_${dupe_count++}.db`;
        }

        const db = await open({
            filename: "./" + new_file_name,
            driver: sqlite3.Database,
        });
        await db.run(schema);
        console.log("Generated db: " + new_file_name);
    },
};

export default generate;
