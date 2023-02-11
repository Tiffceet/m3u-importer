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

export class ProgressBar {
    progress = 0;

    constructor(min = 0, max = 100) {
        this.min = min;
        this.max = max;
    }

    pause() {
        process.stdout.clearLine(); // clear current text
        process.stdout.cursorTo(0); // move cursor to beginning of line
    }

    resume() {
        this.render(this.progress);
    }

    end() {
        console.log("");
    }

    render(progress) {
        this.progress = progress;
        const maxBarLength = 20;
        // Precision .00
        const p2 = (num) => (Math.round(num * 100) / 100).toFixed(2);

        let percentComplete = this.progress / this.max;
        let doneCount = Math.floor(maxBarLength * percentComplete);

        let bar = "";

        for (let i = 0; i < doneCount; i++) {
            bar += "=";
        }

        for (let i = 0; i < maxBarLength - doneCount; i++) {
            bar += "-";
        }

        process.stdout.clearLine(); // clear current text
        process.stdout.cursorTo(0); // move cursor to beginning of line
        process.stdout.write(
            `[${bar}] ${p2(percentComplete * 100)}% (${this.progress}/${
                this.max
            })`
        );
    }
}
