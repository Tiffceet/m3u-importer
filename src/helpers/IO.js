import * as readline from "readline";
export async function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return await new Promise((resolve, reject) => {
        rl.question(question, async (response) => {
            rl.close();
            resolve(response);
        });
    });
}
