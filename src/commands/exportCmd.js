import { parseMobileV5Db } from "./../services/PlaylistParser.js";
import * as fs from "fs";
import { ProgressBar, prompt } from "../helpers/IO.js";
import { getMediaMetadata } from "../helpers/MediaMetadataParser.js";
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
            })
            .option("parseSongMetadata", {
                alias: "p",
                describe:
                    "Attempt to parse song metadata from provided songFolderPath and add it into .m3u8 metadata",
                boolean: true,
            });
    },
    handler: async (argv) => {
        let { dbfile, songFolderPath, exportFolderPath, parseSongMetadata } =
            argv;
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
        let response = await prompt("Continue? [y/N] ");
        if (response !== "y") {
            return;
        }

        let playlistTitles = Object.keys(playlist);

        if (!fs.existsSync(exportFolderPath)) {
            fs.mkdirSync(exportFolderPath, { recursive: true });
        }

        let metadataReadCounter = {
            success: 0,
            failed: 0,
        };

        const totalSongs = Object.entries(playlist).reduce(
            (prev, cur, i) => prev + cur[1].length,
            0
        );
        let songsProcessed = 0;
        const progressBar = new ProgressBar(0, totalSongs);

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

                // Fields to be inserted
                let mediaLengthSeconds = "";
                let songTitle = songFileWithoutExtension;
                let songFullPath = `${songFolderPath}\\${songFileName}`;

                if (parseSongMetadata) {
                    try {
                        let { title, duration } = await getMediaMetadata(
                            songFullPath
                        );

                        // Only overwrite metadata if exists
                        if (typeof duration === "number") {
                            mediaLengthSeconds = Math.floor(duration);
                        }

                        if (typeof title === "string" && title.trim() !== "") {
                            songTitle = title;
                        }

                        metadataReadCounter.success++;
                    } catch (err) {
                        progressBar.pause();
                        console.warn(
                            `Cannot read metadata (songFullPath=${songFullPath};playlist=${playlistTitles[i]})`
                        );
                        progressBar.resume();
                        metadataReadCounter.failed++;
                    }
                }

                m3u8Output += `#EXTINF:${mediaLengthSeconds},${songTitle}\n`;
                m3u8Output += `${songFullPath}\n`;
                songsProcessed++;
                progressBar.render(songsProcessed);
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
        if (parseSongMetadata) {
            console.log(
                `${metadataReadCounter.success}/${
                    metadataReadCounter.failed + metadataReadCounter.success
                } file(s) metadata parsed`
            );
        }
        console.log(`${playlistTitles.length} playlists exported.`);
    },
};

export default exportCmd;
