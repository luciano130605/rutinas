import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { sileo } from "sileo";
import { Minus, Plus, Pause, Play, Timer } from 'lucide-react';
import { formatElapsed } from '../utils/time';
import { playBeep } from '../utils/audio';
import "./descanso.css";
import "./rutina.css";

const stopAll = (e) => e.stopPropagation();

let store = null;         // { total, running, endTime, pausedRemaining }
let toastOpen = false;    // si el toast está actualmente visible
let intervalId = null;
let beeped = false;
let realToastId = null;
let wakeLock = null;
const listeners = new Set();

function notify() {
    listeners.forEach(fn => fn());
}

// --- Núcleo: tiempo restante calculado contra un timestamp real ---
function getRemaining() {
    if (!store) return 0;
    if (!store.running) return store.pausedRemaining;
    return Math.max(0, Math.round((store.endTime - Date.now()) / 1000));
}

function tick() {
    if (!store) return;
    const remaining = getRemaining();
    if (remaining <= 0 && !beeped) {
        beeped = true;
        playBeep();
        sileo.success({ title: "Tiempo terminado", duration: 3000 });
    }
    notify();
}

function adjust(delta) {
    if (!store) return;
    if (store.running) {
        store.endTime += delta * 1000;
        const remaining = getRemaining();
        store.total = Math.max(store.total, remaining);
        if (remaining > 0) beeped = false;
    } else {
        store.pausedRemaining = Math.max(0, store.pausedRemaining + delta);
        store.total = Math.max(store.total, store.pausedRemaining);
        if (store.pausedRemaining > 0) beeped = false;
    }
    notify();
}

function togglePause() {
    if (!store) return;
    if (store.running) {
        store.pausedRemaining = getRemaining();
        store.running = false;
    } else {
        store.endTime = Date.now() + store.pausedRemaining * 1000;
        store.running = true;
    }
    notify();
}

// --- Wake lock (best-effort, no rompe nada si el navegador no lo soporta) ---
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (e) { /* silencioso: iOS viejo, permisos, etc. */ }
}
function releaseWakeLock() {
    try { wakeLock && wakeLock.release(); } catch (e) { }
    wakeLock = null;
}

// --- Crear / mostrar / ocultar el toast (independiente del timer) ---
function createToast() {
    realToastId = sileo.action({
        title: <TituloDescanso />,
        duration: null,
        autopilot: false,
        description: <ContenidoDescanso />,
        button: {
            title: "Cancelar",
            className: "btns eliminar",
            onClick: dismiss,
        },
        styles: {
            container: "sileo-cont",
            title: "sileo-title",
            description: "sileo-description",
            button: "btns eliminar sileo desc",
        },
    });
}

function hideToast() {
    if (realToastId) {
        try { sileo.dismiss(realToastId); } catch (e) { }
        realToastId = null;
    }
    toastOpen = false;
    notify();
}

function showToast() {
    if (!store) return;
    if (realToastId) {
        try { sileo.dismiss(realToastId); } catch (e) { }
        realToastId = null;
    }
    createToast();
    toastOpen = true;
    notify();
}

function toggleToast() {
    if (toastOpen) hideToast(); else showToast();
}

function dismiss() {
    clearInterval(intervalId);
    intervalId = null;
    store = null;
    toastOpen = false;
    releaseWakeLock();
    listeners.clear();
    if (realToastId) {
        try { sileo.dismiss(realToastId); } catch (e) { }
    }
    realToastId = null;
}

function useDescansoStore() {
    const [, force] = useState(0);
    useEffect(() => {
        const fn = () => force(v => v + 1);
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);
    return store;
}

// Recalcula apenas la pestaña vuelve a estar visible (se pone al día al toque)
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            tick();
            if (store && store.running) requestWakeLock();
        }
    });
}

function RelojDescanso({ remaining, total, size = 14 }) {
    const stroke = 1.6;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const elapsedPct = total > 0 ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) : 0;
    const offset = circumference * (1 - elapsedPct / 100);

    const angleDeg = -90 + (elapsedPct / 100) * 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    const handLen = radius * 0.6;
    const cx = size / 2;
    const cy = size / 2;
    const hx = cx + handLen * Math.cos(angleRad);
    const hy = cy + handLen * Math.sin(angleRad);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="reloj-descanso">
            <circle cx={cx} cy={cy} r={radius} fill="none" strokeWidth={stroke} className="reloj-descanso-bg" />
            <circle
                cx={cx} cy={cy} r={radius}
                fill="none" strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="reloj-descanso-fill"
            />
            <line x1={cx} y1={cy} x2={hx} y2={hy} strokeWidth={stroke} strokeLinecap="round" className="reloj-descanso-mano" />
        </svg>
    );
}

function TituloDescanso() {
    const s = useDescansoStore();
    if (!s) return null;
    const remaining = getRemaining();
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RelojDescanso remaining={remaining} total={s.total} /> {formatElapsed(remaining * 1000)}
        </span>
    );
}

function ContenidoDescanso() {
    const s = useDescansoStore();
    const rootRef = React.useRef(null);
    const remaining = s ? getRemaining() : 0;

    React.useEffect(() => {
        if (!s || !rootRef.current) return;
        const cont = rootRef.current.closest('.sileo-cont');
        if (!cont) return;
        const pct = s.total > 0
            ? Math.min(100, Math.max(0, ((s.total - remaining) / s.total) * 100))
            : 0;
        cont.style.setProperty('--pct', `${pct}%`);
    }, [remaining, s?.total]);

    if (!s) return null;
    const { running } = s;

    return (
        <div ref={rootRef} className="tiempo-toast" onPointerDown={stopAll} onMouseDown={stopAll} onClick={stopAll}>
            <div className="tiempo-controles minimal">
                <div role="button" tabIndex={0} className="mini-btn" title="Restar 15s" onClick={() => adjust(-15)}>
                    <Minus size={16} />
                </div>
                <div role="button" tabIndex={0} className="mini-btn descanso" title={running ? 'Pausar' : 'Reanudar'} onClick={togglePause}>
                    {running ? <Pause size={16} /> : <Play size={16} />}
                </div>
                <div role="button" tabIndex={0} className="mini-btn" title="Sumar 15s" onClick={() => adjust(15)}>
                    <Plus size={16} />
                </div>
            </div>
        </div>
    );
}

// --- Botón circular fijo: abre/cierra el toast sin tocar el timer ---
export function DescansoBotonFlotante() {
    const s = useDescansoStore();
    
    if (!s) return null;

    const remaining = getRemaining();

    const btn = (
        <button
            type="button"
            className="btn acento descanso-fab"
            title={toastOpen ? 'Ocultar temporizador de descanso' : 'Mostrar temporizador de descanso'}
            onClick={toggleToast}
        >
            <Timer size={20} />
        </button>
    );

    return ReactDOM.createPortal(btn, document.body);
}

export default function openTiempoDescansoToast(seconds) {
    console.log('[descanso] abriendo toast, seconds=', seconds);
    beeped = false;

    if (store) {
        clearInterval(intervalId);
        intervalId = null;
        if (realToastId) {
            try { sileo.dismiss(realToastId); } catch (e) { }
        }
        store = null;
        realToastId = null;
    }

    store = { total: seconds, running: true, endTime: Date.now() + seconds * 1000, pausedRemaining: seconds };
    intervalId = setInterval(tick, 1000);

    createToast();
    toastOpen = true;
    requestWakeLock();
    notify();

    return realToastId;
}

export function resetDescansoState() {
    dismiss();
}
