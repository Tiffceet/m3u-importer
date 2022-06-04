import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as fs from "fs";
import { parseString } from "xml2js";
import { default as migrate } from "./migrate.js";
const generate = {
    command: "generate",
    description: "Generate blank db file with preset template",
    builder: (yargs, helpOrVersionSet) => {
        return yargs
            .option("winamp", {
                describe: "generate from winamp playlist",
                boolean: true,
            })
            .option("t", {
                alias: "tpath",
                describe:
                    "Target path to use if generating from existing playlist (e.g. --winamp)",
                type: "string",
                demandOption: false,
            })
            .option("n", {
                alias: "name",
                describe: "name of the file to be generated",
                type: "string",
                demandOption: false,
            });
    },
    handler: async (argv) => {
        let { name: playlist_name, winamp, tpath } = argv;
        if (winamp && !tpath) {
            console.log("Please provide target path with --tpath");
            return;
        }

        let { path: new_path, name: new_file_name } =
            await generate.generate_new_db(playlist_name);

        if (winamp && tpath) {
            console.log("Using tpath: " + tpath)
            let wa_playlists = await generate.get_winamp_playlists();
            for (let i = 0; i < wa_playlists.length; i++) {
                const { playlist_name, song_files } = wa_playlists[i];
                let db = await open({
                    filename: new_path,
                    driver: sqlite3.Database,
                });
                console.log("Importing " + playlist_name + "...");
                await migrate.import_playlist(
                    db,
                    playlist_name,
                    song_files,
                    tpath
                );
            }
        }

        console.log("");
        console.log("Generated db: " + new_file_name);
    },
    get_winamp_playlists: async () => {
        const base_path =
            process.env.appdata + "\\winamp\\plugins\\ml\\playlists\\";

        let winamp_playlist_xml = fs
            .readFileSync(base_path + "playlists.xml", "utf16le")
            .trim();
        return await new Promise((resolve, reject) => {
            parseString(winamp_playlist_xml, async (err, result) => {
                // console.log(result);
                // result.playlists.playlist.length
                let playlists = [];
                for (let i = 0; i < result.playlists.playlist.length; i++) {
                    const { filename, title, songs } =
                        result.playlists.playlist[i]["$"];
                    if (!fs.existsSync(base_path + filename)) {
                        continue;
                    }
                    let { playlist_name, song_files } = await migrate.parseM3U(
                        base_path + filename
                    );
                    if (!playlist_name || !song_files) {
                        console.log("Failed to parse " + base_path + filename);
                        continue;
                    }
                    playlist_name = title;
                    playlists.push({ playlist_name, song_files });
                }
                resolve(playlists);
            });
        });
    },

    generate_new_db: async (playlist_name) => {
        if (!playlist_name) {
            playlist_name = "new_backup";
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
        return { path: "./" + new_file_name, name: new_file_name };
    },
};

export default generate;
