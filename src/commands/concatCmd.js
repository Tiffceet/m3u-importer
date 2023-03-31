import * as fs from "fs";
import { plus, minus } from "../helpers/lrcTimestamp.js";

const concatCmd = {
    command: "concat <files..>",
    description: "Combine multiple .lrc files",
    builder: (yargs, helpOrVersionSet) => {
        return yargs
            .positional("files", {
                describe: "File path to your .lrc file",
                type: "string",
            })
            .option("nosep", {
                describe: "Do not insert seperator between line",
                type: "boolean",
                demandOption: false,
            })
            .option("sepchar", {
                describe: "Seperator character to use (Default: =)",
                type: "string",
                demandOption: false,
            })
            .option("sepcount", {
                describe: "Seperator character count (Default: 40)",
                type: "number",
                demandOption: false,
            });
    },
    handler: async (argv) => {
        const nosep = argv.nosep;
        const seperatorChar = argv.sepchar ?? "-";
        const seperatorCount = argv.sepcount ? Number(argv.sepcount) : 40;
        const seperator = seperatorChar.repeat(seperatorCount);
        const lrcs = [];

        // Check if all files have same line numbers
        for (const idx in argv.files) {
            const filePath = argv.files[idx];
            const fileContent = await fs.readFileSync(filePath, {
                encoding: "UTF-8",
            });

            const lyricsLines = fileContent.split("\n").map((x) => x.trim());

            if (lyricsLines.length <= 0) {
                throw new Error(`Empty file (${filePath})`);
            }

            lrcs.push({ filePath, lyricsLines });

            if (idx === "0") {
                continue;
            }

            if (lyricsLines.length !== lrcs[0].lyricsLines.length) {
                throw new Error(`Line numbers do not match (${filePath})`);
            }
        }
        // Check for first file that has timestamp
        let mainLrc = null;
        for (const idx in lrcs) {
            const { filePath, lyricsLines } = lrcs[idx];
            // Contains timestamp
            const containTimestamp =
                /\[[0-9]{2}[:.][0-9]{2}[:.][0-9]{2}\].*/.test(lyricsLines[0]);
            if (containTimestamp) {
                mainLrc = lrcs.splice(idx, 1);
                break;
            }
        }

        if (!mainLrc) {
            throw new Error("None of the files contain timestamp");
        }

        mainLrc = mainLrc[0];

        // Parse main file
        // For each lyrics in main file, distribute other file equally always 1|23 if even number total
        const output = [];

        let bottom = null;
        mainLrc.lyricsLines.forEach((line, lineIdx) => {
            const top = lrcs.slice(0, lrcs.length / 2);
            if (bottom) {
                const {
                    lrcsArr: blrcsArr,
                    line: bline,
                    lineIdx: blineIdx,
                } = bottom;
                blrcsArr.forEach(({ filePath, lyricsLines }, idx) => {
                    output.push(
                        minus(
                            line,
                            top.length + blrcsArr.length - idx + 1,
                            lyricsLines[lineIdx-1]
                        )
                    );
                });
                if (!nosep) output.push(minus(line, top.length + 1, seperator));
            } else {
                if (!nosep) output.push(minus(line, top.length + 1, seperator));
            }

            top.forEach(({ filePath, lyricsLines }, idx) => {
                output.push(
                    minus(line, top.length - idx, lyricsLines[lineIdx])
                );
            });
            output.push(line);
            bottom = {
                lrcsArr: lrcs.slice(lrcs.length / 2),
                line,
                lineIdx,
            };
        });

        if (bottom) {
            // Flush last bottom line text
            bottom.lrcsArr.forEach(({ lyricsLines }) => {
                output.push(`[99:99:99]${lyricsLines[lyricsLines.length - 1]}`);
            });
            if (!nosep) output.push(`[99:99:99]${seperator}`);
        }

        const filename = mainLrc.filePath.replace(/^.*[\\\/]/, "");

        await fs.writeFileSync(`[concat]${filename}`, output.join("\n"), {
            encoding: "utf-8",
        });

        console.log(`Concatenated file generated: ${filename}`);
    },
};

export default concatCmd;
