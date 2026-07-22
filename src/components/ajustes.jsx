import React, { useState } from 'react';
import "./ajustes.css";
import { Check, Moon, Sun, RotateCcw, ArrowUpToLine, ArrowDownToLine, Bell } from 'lucide-react';

const ACENTOS = [
    { id: 'acento-verde', nombre: 'Verde', color: '#c6ff34' },
    { id: 'acento-celeste', nombre: 'Celeste', color: '#b2d5e5' },
    { id: 'acento-naranja', nombre: 'Naranja', color: '#ff9a4a' },
    { id: 'acento-violeta', nombre: 'Violeta', color: '#b28aff' },
];

const MODO_DEFAULT = true; // oscuro
const ACENTO_DEFAULT = 'acento-verde';
const POSICION_DEFAULT = 'bottom';
const REMINDER_TIME_DEFAULT = '10:00';

export default function Ajustes({
    open,
    modoOscuro,
    onToggleModo,
    acento,
    onChangeAcento,
    toasterPosition,
    onChangeToasterPosition,
    reminderTime,
    onChangeReminderTime,
    reminderEnabled,
    onToggleReminder,
}) {
    const [resetFeedback, setResetFeedback] = useState(false);

    const resetearAjustes = () => {
        if (modoOscuro !== MODO_DEFAULT) onToggleModo();
        onChangeAcento(ACENTO_DEFAULT);
        onChangeToasterPosition(POSICION_DEFAULT);
        onChangeReminderTime(REMINDER_TIME_DEFAULT);
        if (!reminderEnabled) onToggleReminder();
        setResetFeedback(true);
        setTimeout(() => setResetFeedback(false), 1500);
    };

    return (
        <div className={`ajustes-dropdown ${open ? 'abierto' : ''}`}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="ajustes-dropdown-seccion-titulo">Color de acento</div>

                <button
                    className='mini-btn a'
                    role="switch"
                    aria-checked={modoOscuro}
                    onClick={onToggleModo}
                >
                    {modoOscuro ? <Moon size={16} /> : <Sun size={16} />}
                </button>
            </div>

            {ACENTOS.map((a) => (
                <div
                    key={a.id}
                    className={`ajustes-dropdown-acento-fila ${acento === a.id ? 'select' : ''}`}
                    onClick={() => onChangeAcento(a.id)}
                >
                    <span className="acento-dot" style={{ background: a.color }} />
                    <span className="ajustes-dropdown-label">{a.nombre}</span>
                    {acento === a.id && <Check size={14} className='acento-check' />}
                </div>
            ))}

            <div className="ajustes-dropdown-separador" />

            <div className="ajustes-dropdown-seccion-titulo">Posición de las notificaciones</div>

            <div className="ajustes-dropdown-toggle-fila">
                <button
                    className={`btns agregar ajustes ${toasterPosition === 'top' ? 'select' : ''}`}
                    onClick={() => onChangeToasterPosition('top')}
                >
                    Arriba
                </button>
                <button
                    className={`btns agregar ajustes ${toasterPosition === 'bottom' ? 'select' : ''}`}
                    onClick={() => onChangeToasterPosition('bottom')}
                >
                    Abajo
                </button>
            </div>

            <div className="ajustes-dropdown-separador" />


            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="ajustes-dropdown-seccion-titulo">Recordatorio diario</div>
                <button
                    className={`mini-btn noti ${reminderEnabled ? "activa" : ""}`}
                    role="switch"
                    aria-checked={reminderEnabled}
                    onClick={onToggleReminder}
                >
                    {reminderEnabled ? "activado" : "Desactivado"}
                </button>
            </div>

            <input
                type="time"
                className={`input-time-ajustes ${!reminderEnabled ? "disabled" : ""}`}
                value={reminderTime}
                onChange={(e) => onChangeReminderTime(e.target.value)}
                disabled={!reminderEnabled}
            />

            <div className="ajustes-dropdown-separador" />

            <button
                className="btns agregar ajustes"
                onClick={resetearAjustes}
            >
                {resetFeedback ? 'Valores restablecidos' : 'Restablecer valores por defecto'}
            </button>
        </div>
    );
}