function parseTimestamp(timestamp) {
    const regex = /\[([0-9]{2})[:.]([0-9]{2})[:.]([0-9]{2})\](.*)/;
    let [_, m, s, ms, lyric] = timestamp.match(regex);
    m = Number(m);
    s = Number(s);
    ms = Number(ms);
    return { m, s, ms, lyric };
}

function pad(str) {
    return String(str).padStart(2, "0");
}

function replaceLyrics(timestamp, qlyric = "") {
    let { m, s, ms, lyric } = parseTimestamp(timestamp);
    return `[${pad(m)}:${pad(s)}.${pad(ms)}]${qlyric ? qlyric : lyric}`;
}

export function plusOne(timestamp, qlyric = "") {
    let { m, s, ms, lyric } = parseTimestamp(timestamp);
    ms += 1;
    if (ms > 99) {
        ms = 0;
        s += 1;
        if (s > 59) {
            s = 0;
            m += 1;
            if (m > 99) {
                m = 99;
                s = 59;
                ms = 99;
            }
        }
    }

    return `[${pad(m)}:${pad(s)}.${pad(ms)}]${qlyric ? qlyric : lyric}`;
}

export function minusOne(timestamp, qlyric = "") {
    let { m, s, ms, lyric } = parseTimestamp(timestamp);
    ms -= 1;
    if (ms < 0) {
        ms = 99;
        s -= 1;
        if (s < 0) {
            s = 59;
            m -= 1;
            if (m < 0) {
                m = 0;
                s = 0;
                ms = 0;
            }
        }
    }

    return `[${pad(m)}:${pad(s)}.${pad(ms)}]${qlyric ? qlyric : lyric}`;
}

export function plus(timestamp, count, qlyric) {
    for (let i = 0; i < count; i++) {
        timestamp = plusOne(timestamp, qlyric);
    }
    return replaceLyrics(timestamp, qlyric)
}

export function minus(timestamp, count, qlyric) {
    for (let i = 0; i < count; i++) {
        timestamp = minusOne(timestamp, qlyric);
    }
    return replaceLyrics(timestamp, qlyric)
}
