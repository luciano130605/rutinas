import React, { useEffect, useState } from 'react';
import { sileo } from "sileo";
import { Minus, Plus, Pause, Play, Timer } from 'lucide-react';
import { formatElapsed } from '../utils/time';
import { playBeep } from '../utils/audio';
import "./descanso.css";
import "./rutina.css";

const stopAll = (e) => e.stopPropagation();

let store = null;
let intervalId = null;
let beeped = false;
let realToastId = null; // el id de VERDAD que devuelve sileo, no uno inventado por nosotros
const listeners = new Set();

function notify() {
    listeners.forEach(fn => fn());
}

function tick() {
    if (!store || !store.running) return;
    store.remaining = Math.max(0, store.remaining - 1);
    if (store.remaining <= 0 && !beeped) {
        beeped = true;
        playBeep();
        sileo.success({ title: "Tiempo terminado", duration: 3000 }); // 👈 nuevo
    }
    notify();
}

function adjust(delta) {
    if (!store) return;
    store.remaining = Math.max(0, store.remaining + delta);
    store.total = Math.max(store.total, store.remaining);
    if (store.remaining > 0) beeped = false;
    notify();
}

function togglePause() {
    if (!store) return;
    store.running = !store.running;
    notify();
}

function dismiss() {
    clearInterval(intervalId);
    intervalId = null;
    store = null;
    listeners.clear();
    if (realToastId) {
        sileo.dismiss(realToastId); // ahora sí, el id real
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

function RelojDescanso({ remaining, total, size = 14 }) {
    const stroke = 1.6;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const elapsedPct = total > 0 ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) : 0;
    const offset = circumference * (1 - elapsedPct / 100);

    // la "agujita" gira en sentido horario a medida que pasa el tiempo
    const angleDeg = -90 + (elapsedPct / 100) * 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    const handLen = radius * 0.6;
    const cx = size / 2;
    const cy = size / 2;
    const hx = cx + handLen * Math.cos(angleRad);
    const hy = cy + handLen * Math.sin(angleRad);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="reloj-descanso">
            <circle
                cx={cx} cy={cy} r={radius}
                fill="none" strokeWidth={stroke}
                className="reloj-descanso-bg"
            />
            <circle
                cx={cx} cy={cy} r={radius}
                fill="none" strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="reloj-descanso-fill"
            />
            <line
                x1={cx} y1={cy} x2={hx} y2={hy}
                strokeWidth={stroke}
                strokeLinecap="round"
                className="reloj-descanso-mano"
            />
        </svg>
    );
}

function TituloDescanso() {
    const s = useDescansoStore();
    if (!s) return null;
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RelojDescanso remaining={s.remaining} total={s.total} /> {formatElapsed(s.remaining * 1000)}
        </span>
    );
}
function ContenidoDescanso() {
    const s = useDescansoStore();
    const rootRef = React.useRef(null);

    React.useEffect(() => {
        if (!s || !rootRef.current) return;
        const cont = rootRef.current.closest('.sileo-cont');
        if (!cont) return;
        const pct = s.total > 0
            ? Math.min(100, Math.max(0, ((s.total - s.remaining) / s.total) * 100))
            : 0;
        cont.style.setProperty('--pct', `${pct}%`);
    }, [s?.remaining, s?.total]);

    if (!s) return null;
    const { remaining, running } = s;

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
export function openTiempoDescansoToast(seconds) {
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

    store = { remaining: seconds, total: seconds, running: true };
    intervalId = setInterval(tick, 1000);

    store = { remaining: seconds, total: seconds, running: true };
    clearInterval(intervalId);
    intervalId = setInterval(tick, 1000);

    // sileo NO soporta "id" como opción -> siempre genera uno propio.
    // Lo capturamos acá para poder cerrar ESTE toast puntual después.
    realToastId = sileo.action({
        title: <TituloDescanso />,
        duration: null, // según la doc de sileo: null = sticky (no se auto-cierra)
        autopilot: false, // evita que se colapse/expanda solo
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

    return realToastId;
}

export function resetDescansoState() {
    clearInterval(intervalId);
    intervalId = null;
    if (realToastId) {
        try { sileo.dismiss(realToastId); } catch (e) { }
    }
    store = null;
    realToastId = null;
    listeners.clear();
}