// components/TiempoDescansoToast.jsx
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

function TituloDescanso() {
    const s = useDescansoStore();
    if (!s) return null;
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Timer size={14} /> {formatElapsed(s.remaining * 1000)}
        </span>
    );
}

function ContenidoDescanso() {
    const s = useDescansoStore();
    if (!s) return null;
    const { remaining, total, running } = s;
    const pct = total > 0 ? Math.max(0, (remaining / total) * 100) : 0;
    return (
        <div className="tiempo-toast" onPointerDown={stopAll} onMouseDown={stopAll} onClick={stopAll}>
            <div className="tiempo-progreso-cont">
                <div className="tiempo-progreso-fill" style={{ width: `${pct}%` }} />
            </div>
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
        // Ya hay un toast real y vivo: solo actualizamos el store.
        // NO volvemos a llamar a sileo.action -> no se crea un toast nuevo.
        store.remaining = seconds;
        store.total = seconds;
        store.running = true;
        clearInterval(intervalId);
        intervalId = setInterval(tick, 1000);
        notify();
        return realToastId;
    }

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