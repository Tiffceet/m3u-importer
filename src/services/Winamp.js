import { parseString } from "xml2js";
import * as fs from "fs";
import { parseM3U } from "./PlaylistParser.js";
import { WINAMP_PLAYLIST_PATH } from "../globals.js";
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
                    console.log("Failed to parse " + `${WINAMP_PLAYLIST_PATH}\\${filename}`);
                    continue;
                }
                playlist_name = title;
                playlists.push({ playlist_name, song_files });
            }
            resolve(playlists);
        });
    });
}
