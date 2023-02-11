import { prompt } from "../../../helpers/IO.js";
import { removeWinampPlaylistSongsDuplicates } from "../../../services/Winamp.js";
const rd = {
    command: "rd",
    description: "Remove duplicates in all playlist",
    builder: (yargs, helpOrVersionSet) => {
        return yargs;
    },
    handler: async (argv) => {
        console.log("You really want winamp to be closed when doing this.");
        let response = await prompt("Is winamp closed ? [y/N] ");
        if (response !== "y") return;
        
        let results = await removeWinampPlaylistSongsDuplicates();
        let duplicateEntries = Object.entries(results.duplicates);
        duplicateEntries.forEach(([name, count]) => {
            console.log(
                `Successfully removed ${count} duplicates from ${name} !`
            );
        });
        console.log(`Processed ${duplicateEntries.length} playlist(s).`);
    },
};

export default rd;
