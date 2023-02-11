import { parseMobileV5Db } from "./../services/PlaylistParser.js";
import * as fs from "fs";
import { prompt } from "../helpers/IO.js";
const exportCmd = {
    command: "export <dbfile> <songFolderPath> [exportFolder]",
    description: "Export .db file into .m3u8 playlist",
    builder: (yargs, helpOrVersionSet) => {
        return yargs
            .positional("dbfile", {
                describe: "File path to your sqlite db",
                type: "string",
            })
            .positional("songFolderPath", {
                describe: "Song absolute folder path on this machine",
                type: "string",
            })
            .positional("exportFolderPath", {
                describe: "Optional export folder path; Default: playlists",
                type: "string",
            });
    },
    handler: async (argv) => {
        let { dbfile, songFolderPath, exportFolderPath } = argv;
        if (!dbfile) {
            console.log("Please provide your sqlite db file");
            return;
        }

        if (!exportFolderPath) {
            exportFolderPath = "playlists";
        }

        let playlist = {};
        try {
            playlist = await parseMobileV5Db(dbfile);
        } catch (err) {
            console.log("Failed to open db file provided.");
            return;
        }

        console.log("songFolderPath: " + songFolderPath);
        console.log(
            "Playlists will be exported to this folder: " + exportFolderPath
        );
        let response = await prompt("Continue? [y/N] ")
        if(response !== 'y') {
            return;
        }

        let playlistTitles = Object.keys(playlist);

        if (!fs.existsSync(exportFolderPath)) {
            fs.mkdirSync(exportFolderPath, { recursive: true });
        }

        // For each playlist
        for (let i = 0; i < playlistTitles.length; i++) {
            const songPaths = playlist[playlistTitles[i]];

            let m3u8Output = "#EXTM3U\n";
            // For each song in playlist
            for (let j = 0; j < songPaths.length; j++) {
                const songPath = songPaths[j];
                let songFileName = songPath.slice(
                    songPath.lastIndexOf("/") + 1
                );

                let songFileWithoutExtension = songFileName.slice(
                    0,
                    songFileName.lastIndexOf(".")
                );

                m3u8Output += `#EXTINF:,${songFileWithoutExtension}\n`;
                m3u8Output += `${songFolderPath}\\${songFileName}\n`;
            }

            // Add: \ufeff because winamp is stopid (UTF-8 BOM)
            fs.writeFileSync(
                `${exportFolderPath}\\${playlistTitles[i]}.m3u8`,
                "\ufeff" + m3u8Output,
                {
                    encoding: "utf8",
                }
            );
        }

        console.log("");
        console.log(`${playlistTitles.length} playlists exported.`);
    },
};

export default exportCmd;
