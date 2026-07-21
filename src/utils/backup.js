// Codifica/decodifica objetos completos (rutinas o historial) para exportar como link o archivo.

export function encodeBackup(data) {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function decodeBackup(code) {
    try {
        let b64 = code.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const json = decodeURIComponent(escape(atob(b64)));
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

export function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try { resolve(JSON.parse(reader.result)); }
            catch (e) { reject(e); }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}