export function formaTime(ms) {

    const s = Math.floor(ms / 1000);

    const mm = Math.floor(s / 60)
        .toString()
        .padStart(2, "0");

    const ss = (s % 60)
        .toString()
        .padStart(2, "0");


    return `${mm}:${ss}`;
}