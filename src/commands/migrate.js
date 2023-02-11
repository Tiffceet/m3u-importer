import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as fs from "fs";
import { getExistingPath, import_playlist } from "./../services/MobileV5.js";
import { parseM3U } from "./../services/PlaylistParser.js";
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
                describe:
                    "path to m3u playlist; Can be to .m3u / .m3u8 file directly or directory name containing the playlists",
                type: "string",
                demandOption: true,
            })
            .option("t", {
                alias: "tpath",
                describe:
                    "Target path to set on the target db when migrating; Only needed if the program is unable to find existing paths on db",
                type: "string",
                demandOption: false,
            });
    },
    handler: async (argv) => {
        let { dbfile, playlistpath, tpath } = argv;
        let db = await open({
            filename: dbfile,
            driver: sqlite3.Database,
        });

        let existing_path = tpath || (await getExistingPath(db));
        if (!existing_path) {
            console.log(
                "Unable to find existing path. Please use the --tpath flag to provide a target path"
            );
            return;
        }
        if (!existing_path.endsWith("/")) {
            existing_path = existing_path + "/";
        }

        console.log("Using DB: " + dbfile);
        console.log("Using target path: " + existing_path);
        console.log("");
        let isDirectory = fs.statSync(playlistpath).isDirectory();
        if (!isDirectory) {
            let { playlist_name, song_files } = await parseM3U(
                playlistpath,
                true
            );
            console.log("Importing playlist: " + playlist_name);
            let added_songs_count = await import_playlist(
                db,
                playlist_name,
                song_files,
                existing_path
            );
            console.log(
                `Imported ${added_songs_count} song(s) into ${playlist_name}.`
            );
        } else {
            let filenames = fs.readdirSync(playlistpath);
            if (!playlistpath.endsWith("\\")) {
                playlistpath = playlistpath + "\\";
            }
            for (let i = 0; i < filenames.length; i++) {
                const filename = filenames[i];
                let filepath = playlistpath + filename;
                if (fs.statSync(filepath).isDirectory()) {
                    continue;
                }
                let m3u = await parseM3U(filepath);
                if (!m3u) {
                    continue;
                }
                console.log("Migrating playlist: " + m3u.playlist_name);
                let added_songs_count = await import_playlist(
                    db,
                    m3u.playlist_name,
                    m3u.song_files,
                    existing_path
                );
                console.log(
                    `Imported ${added_songs_count} song(s) into ${m3u.playlist_name}.`
                );
            }
        }
        console.log("");
        console.log("Migration completed.");
    },
};

export default migrate;
