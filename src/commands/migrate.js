import * as events from "events";
import * as readline from "readline";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as fs from "fs";
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

        let existing_path = tpath || (await migrate.getExistingPath(db));
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
            let { playlist_name, song_files } = await migrate.parseM3U(
                playlistpath,
                true
            );
            console.log("Importing playlist: " + playlist_name);
            let added_songs_count = await migrate.import_playlist(
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
                let m3u = await migrate.parseM3U(filepath);
                if (!m3u) {
                    continue;
                }
                console.log("Migrating playlist: " + m3u.playlist_name);
                let added_songs_count = await migrate.import_playlist(
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
    import_playlist: async (db, playlist_name, song_files, existing_path) => {
        let existing_songs = (
            await db.all(
                "SELECT * FROM music_playlist WHERE name = ?",
                playlist_name
            )
        )
            .map((x) => x.path)
            .map((x) => x.slice(x.lastIndexOf("/") + 1));
        let sql = "INSERT INTO music_playlist (name, path) values ";

        let new_entry = [];
        song_files.forEach((v, i, a) => {
            if (existing_songs.includes(v)) {
                return;
            }
            if (i == 0) {
                sql += `(?, ?)`;
            } else {
                sql += `,(?, ?)`;
            }
            new_entry.push(playlist_name);
            new_entry.push(`${existing_path}${v}`);
        });

        if (new_entry.length != 0) {
            await db.run(sql, ...new_entry);
        }
        return new_entry.length;
    },
    parseM3U: async (m3u_path, verbose = false) => {
        if (
            !m3u_path.toLowerCase().endsWith(".m3u") &&
            !m3u_path.toLowerCase().endsWith(".m3u8")
        ) {
            if (verbose) {
                console.log(m3u_path + " is not a .m3u / .m3u8 playlist");
            }
            return false;
        }

        let playlist_name = m3u_path.slice(
            m3u_path.lastIndexOf("\\") + 1,
            m3u_path.lastIndexOf(".")
        );

        const rl = readline.createInterface({
            input: fs.createReadStream(m3u_path),
            crlfDelay: Infinity,
        });

        let song_files = [];

        rl.on("line", (line) => {
            if (line.trim().startsWith("#")) {
                return;
            }
            line = line.slice(line.lastIndexOf("\\") + 1);
            song_files.push(line);
        });

        await events.once(rl, "close");
        return { playlist_name, song_files };
    },
    getExistingPath: async (db) => {
        let { ct } = await db.all("SELECT COUNT(*) as ct from music_playlist");
        if (ct < 1) {
            return false;
        }
        let entry = await db.all("SELECT * FROM music_playlist limit 1");
        if (entry.length == 0) {
            return false;
        }
        let [{ path }] = entry;
        return path.slice(0, path.lastIndexOf("/") + 1);
    },
};

export default migrate;
