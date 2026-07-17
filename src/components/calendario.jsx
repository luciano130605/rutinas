import { useState } from "react";
import "./calendario.css"
import { ChevronLeft, ChevronRight } from "lucide-react";



const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
function sameDay(a, b) { return a && b && startOfDay(a).getTime() === startOfDay(b).getTime(); }
function fmtShort(d) { return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
export default function CalendarRange({ from, to, onApply, onClose }) {
    const [viewMonth, setViewMonth] = useState(() => startOfDay(from || to || new Date()));
    const [tempFrom, setTempFrom] = useState(from);
    const [tempTo, setTempTo] = useState(to);

    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));

    const handleClickDay = (day) => {
        if (!tempFrom || (tempFrom && tempTo)) {
            setTempFrom(startOfDay(day));
            setTempTo(null);
        } else if (day < tempFrom) {
            setTempFrom(startOfDay(day));
        } else {
            setTempTo(endOfDay(day));
        }
    };

    const inRange = (day) => {
        if (!tempFrom) return false;
        const end = tempTo || tempFrom;
        return day >= startOfDay(tempFrom) && day <= endOfDay(end);
    };

    const applyPreset = (daysBack) => {
        const to = endOfDay(new Date());
        const from = startOfDay(new Date(Date.now() - daysBack * 86400000));
        onApply(from, to);
    };

    return (
        <div className="hist-cal-overlay" onClick={onClose}>
            <div className="hist-cal-pop" onClick={e => e.stopPropagation()}>
                <div className="hist-cal-presets">
                    <button className="btns agregar calendario" onClick={() => applyPreset(6)}>7 días</button>
                    <button className="btns agregar calendario" onClick={() => applyPreset(29)}>30 días</button>
                    <button className="btns agregar calendario" onClick={() => onApply(null, null)}>Todo</button>
                </div>
                <div className="hist-cal-header">
                    <button className="mini-btn" onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
                    <span>{MESES[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
                    <button className="mini-btn" onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
                </div>
                <div className="hist-cal-grid">
                    {DIAS.map(d => <div key={d} className="hist-cal-dow">{d}</div>)}
                    {cells.map((day, i) => {
                        if (!day) return <div key={i} />;
                        const selected = sameDay(day, tempFrom) || sameDay(day, tempTo);
                        const isToday = sameDay(day, new Date());
                        return (
                            <div
                                key={i}
                                className={`hist-cal-day ${inRange(day) ? 'in-range' : ''} ${selected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                onClick={() => handleClickDay(day)}
                            >
                                {day.getDate()}
                            </div>
                        );
                    })}
                </div>
                <div className="hist-cal-footer">
                    <span className="header-sub">
                        {tempFrom ? fmtShort(tempFrom) : '—'} → {tempTo ? fmtShort(tempTo) : (tempFrom ? 'elegí el final' : '—')}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btns agregar calendario" onClick={() => { setTempFrom(null); setTempTo(null); }}>Limpiar</button>
                        <button className="btns primario calendario" onClick={() => onApply(tempFrom, tempTo || (tempFrom ? endOfDay(tempFrom) : null))}>Aplicar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
