import { parseString } from "xml2js";
import * as fs from "fs";
import { parseM3U } from "./PlaylistParser.js";
import { WINAMP_PLAYLIST_PATH } from "../globals.js";
import * as readline from "readline";
import * as events from "events";
export async function get_winamp_playlists() {
    let winamp_playlist_xml = fs
        .readFileSync(`${WINAMP_PLAYLIST_PATH}\\playlists.xml`, "utf16le")
        .trim();
    return await new Promise((resolve, reject) => {
        parseString(winamp_playlist_xml, async (err, result) => {
            let playlists = [];
            for (let i = 0; i < result.playlists.playlist.length; i++) {
                const { filename, title, songs } =
                    result.playlists.playlist[i]["$"];
                if (!fs.existsSync(`${WINAMP_PLAYLIST_PATH}\\${filename}`)) {
                    continue;
                }
                let { playlist_name, song_files } = await parseM3U(
                    `${WINAMP_PLAYLIST_PATH}\\${filename}`
                );
                if (!playlist_name || !song_files) {
                    console.log(
                        "Failed to parse " +
                            `${WINAMP_PLAYLIST_PATH}\\${filename}`
                    );
                    continue;
                }
                playlist_name = title;
                playlists.push({ playlist_name, song_files });
            }
            resolve(playlists);
        });
    });
}

export async function removeWinampPlaylistSongsDuplicates() {
    let results = {
        duplicates: {},
    };

    let winamp_playlist_xml = fs
        .readFileSync(`${WINAMP_PLAYLIST_PATH}\\playlists.xml`, "utf16le")
        .trim();
    await new Promise((resolve, reject) => {
        parseString(winamp_playlist_xml, async (err, result) => {
            // For each winamp playlist
            for (let i = 0; i < result.playlists.playlist.length; i++) {
                let duplicateCount = 0;
                const { filename, title, songs } =
                    result.playlists.playlist[i]["$"];

                let fullPathToPlaylist = `${WINAMP_PLAYLIST_PATH}\\${filename}`;

                if (!fs.existsSync(fullPathToPlaylist)) {
                    continue;
                }

                const rl = readline.createInterface({
                    input: fs.createReadStream(fullPathToPlaylist),
                    crlfDelay: Infinity,
                });

                let lines = [];
                rl.on("line", (line) => {
                    lines.push(line);
                });

                await events.once(rl, "close");

                let existingEntries = [];
                let newContent = "";
                let ignoreNextLine = false
                for (let i = 0; i < lines.length; i++) {
                    if(ignoreNextLine) {
                        ignoreNextLine = false
                        continue
                    }
                    const line = lines[i];
                    if (line.trim().startsWith("#EXTINF")) {
                        if (
                            existingEntries.find(([a, b]) => {
                                return (
                                    a === lines[i].trim() &&
                                    b === lines[i + 1].trim()
                                );
                            })
                        ) {
                            // Duplicated !
                            ignoreNextLine = true
                            duplicateCount++;
                            continue;
                        }
                        existingEntries.push([
                            lines[i].trim(),
                            lines[i + 1].trim(),
                        ]);
                    }
                    newContent += line + "\n";
                }

                fs.writeFileSync(fullPathToPlaylist, newContent, {
                    encoding: "utf8",
                });
                results.duplicates[title] = duplicateCount;
            }
            resolve();
        });
    });

    return results;
}
