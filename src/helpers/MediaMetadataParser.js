import { parseStream } from "music-metadata";
import * as fs from "fs";
export async function getMediaMetadata(filepath) {
    let stream = fs.createReadStream(filepath);

    // Wait for stream to correctly open
    await new Promise((resolve, reject) => {
        stream.on("open", () => {
            resolve();
        });
        stream.on("error", (err) => {
            reject();
        });
    });

    const metadata = await parseStream(stream);

    let { common, format } = metadata;

    if (!format || !common) {
        throw new Error("Unable to get metadata");
    }

    let { title } = common
    let { duration } = format;

    return { title, duration };
}
