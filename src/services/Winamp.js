import { parseString } from "xml2js";
import * as fs from "fs";
import { parseM3U } from "./PlaylistParser.js";
export async function get_winamp_playlists() {
    const base_path =
        process.env.appdata + "\\winamp\\plugins\\ml\\playlists\\";

    let winamp_playlist_xml = fs
        .readFileSync(base_path + "playlists.xml", "utf16le")
        .trim();
    return await new Promise((resolve, reject) => {
        parseString(winamp_playlist_xml, async (err, result) => {
            let playlists = [];
            for (let i = 0; i < result.playlists.playlist.length; i++) {
                const { filename, title, songs } =
                    result.playlists.playlist[i]["$"];
                if (!fs.existsSync(base_path + filename)) {
                    continue;
                }
                let { playlist_name, song_files } = await parseM3U(
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
}
