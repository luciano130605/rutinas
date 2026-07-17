function toBase64Url(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
}

// Solo guardamos lo esencial (nombre + ejercicios) para que el link no sea gigante.
// Usamos claves cortas (n, ex, m, r, s, w) para ahorrar caracteres en la URL.
export function encodeRoutine(routine) {
    const payload = {
        n: routine.name,
        ex: routine.exercises.map(e => ({
            n: e.name,
            m: e.muscle || '',
            r: e.rest || '',
            s: e.sets.map(s => ({ r: s.reps || '', w: s.weight || '' }))
        }))
    };
    return toBase64Url(JSON.stringify(payload));
}

export function decodeRoutine(code) {
    try {
        const payload = JSON.parse(fromBase64Url(code));
        if (!payload || typeof payload.n !== 'string' || !Array.isArray(payload.ex)) return null;
        return {
            name: payload.n,
            exercises: payload.ex.map(e => ({
                name: e.n,
                muscle: e.m || '',
                rest: e.r || '',
                sets: Array.isArray(e.s) ? e.s.map(s => ({ reps: s.r || '', weight: s.w || '' })) : []
            }))
        };
    } catch (e) {
        return null;
    }
}