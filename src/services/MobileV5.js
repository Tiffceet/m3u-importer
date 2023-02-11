import * as fs from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
export async function generate_new_db(playlist_name) {
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
}

export async function import_playlist(
    db,
    playlist_name,
    song_files,
    existing_path
) {
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
}

export async function getExistingPath(db) {
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
}
