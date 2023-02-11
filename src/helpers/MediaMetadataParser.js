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

    let { format } = metadata;

    if (!format) {
        throw new Error("Unable to get metadata");
    }

    let { duration } = format;

    return { duration };
}
