import * as events from "events";
import * as readline from "readline";
import * as fs from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
export async function parseM3U(m3u_path, verbose = false) {
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
}

export async function parseMobileV5Db(dbfile) {
    let db = await open({
        filename: dbfile,
        driver: sqlite3.Database,
    });
    let songs = await db.all("SELECT * FROM music_playlist");

    let playlists = {};

    for (let i = 0; i < songs.length; i++) {
        const { name, path } = songs[i];
        if (playlists[name]) {
            playlists[name].push(path);
        } else {
            playlists[name] = [path];
        }
    }

    return playlists;
}
