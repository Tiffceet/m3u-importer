import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { generate_new_db, import_playlist } from "../services/MobileV5.js";
import { get_winamp_playlists } from "../services/Winamp.js";
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

        let { path: new_path, name: new_file_name } = await generate_new_db(
            playlist_name
        );

        if (winamp && tpath) {
            console.log("Using tpath: " + tpath);
            let wa_playlists = await get_winamp_playlists();
            for (let i = 0; i < wa_playlists.length; i++) {
                const { playlist_name, song_files } = wa_playlists[i];
                let db = await open({
                    filename: new_path,
                    driver: sqlite3.Database,
                });
                console.log("Importing " + playlist_name + "...");
                await import_playlist(db, playlist_name, song_files, tpath);
            }
        }

        console.log("");
        console.log("Generated db: " + new_file_name);
    },
};

export default generate;
