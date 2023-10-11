// import { prompt } from "../../../helpers/IO.js";
// import { removeWinampPlaylistSongsDuplicates } from "../../../services/Winamp.js";
import * as fs from "fs";
import { parseString } from "xml2js";
import { WINAMP_PLAYLIST_PATH } from "../../../globals.js";
const convert = {
  command: "convert",
  description: "Convert winamp .m3u8 playlist to android .m3u8 playlist",
  builder: (yargs, helpOrVersionSet) => {
    return yargs;
  },
  handler: async (argv) => {
    // Get winamp playlist index
    let winamp_playlist_xml = fs
      .readFileSync(`${WINAMP_PLAYLIST_PATH}\\playlists.xml`, "utf16le")
      .trim();
    return await new Promise((resolve, reject) => {
      parseString(winamp_playlist_xml, async (err, result) => {
        if (!fs.existsSync("output")) {
          fs.mkdirSync("output");
        }

        let playlists = [];
        // Go through each playlist in index
        for (let i = 0; i < result.playlists.playlist.length; i++) {
          const { filename, title, songs } = result.playlists.playlist[i]["$"];
          if (!fs.existsSync(`${WINAMP_PLAYLIST_PATH}\\${filename}`)) {
            continue;
          }

          if (
            !filename.toLowerCase().endsWith(".m3u") &&
            !filename.toLowerCase().endsWith(".m3u8")
          ) {
            // Skip because its not m3u playlist
            continue;
          }

          const file = fs.readFileSync(`${WINAMP_PLAYLIST_PATH}\\${filename}`, {
            encoding: "utf-8",
          });

          // TODO: Come back to this
          const convertedPlaylist = file.replace(
            /C:\\Users\\Looz\\Desktop\\Japanese song Collection\\/g,
            `/storage/emulated/0/Music/Japanese song Collection/`
          );
          fs.writeFileSync(`output/${title}.m3u8`, convertedPlaylist);
        }
        resolve(playlists);
      });
    });
  },
};

export default convert;
