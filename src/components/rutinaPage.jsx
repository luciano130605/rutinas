import React, { useMemo } from 'react';
import { Plus, Bell } from 'lucide-react';
import "./rutina.css"

export default function RutinaPage({ routines, reminders, onNewRoutine, onSelectRoutine }) {
  const hoy = new Date().getDay();

  const rutinasDeHoy = useMemo(() => {
    if (!reminders) return [];
    return routines.filter(r => reminders[r.id] && reminders[r.id].day === hoy);
  }, [routines, reminders, hoy]);

  return (
    <>
      <div className="header-cont">
        <div>
          <h1 className='header-titulo'>Rutinas</h1>
          <div className="header-sub">{routines.length} guardada{routines.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="btn acento" title='Agregar rutina' onClick={onNewRoutine}><Plus size={20} /></div>
      </div>

      <div className="page-cont">
        {rutinasDeHoy.length > 0 && (
          <div
            className="rutina-card"
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
          >
            <Bell size={16} />
            <span>
              Hoy toca: {rutinasDeHoy.map(r => r.name).join(', ')} · {reminders[rutinasDeHoy[0].id].time}
            </span>
          </div>
        )}

        {routines.length === 0 ? (
          <div className="page-sin">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="6" y="27" width="8" height="10" rx="1.5" />
              <rect x="50" y="27" width="8" height="10" rx="1.5" />
              <rect x="14" y="22" width="6" height="20" rx="1.5" />
              <rect x="44" y="22" width="6" height="20" rx="1.5" />
              <line x1="20" y1="32" x2="44" y2="32" />
            </svg>
            <h3>Aún no tienes rutinas</h3>
            <p>Crea tu primera rutina para organizar tus ejercicios, series y empezar a entrenar.</p>
          </div>
        ) : routines.map(r => {
          const muscles = [...new Set(r.exercises.map(e => e.muscle))].slice(0, 4);
          return (
            <div key={r.id} className="rutina-card" onClick={() => onSelectRoutine(r.id)}>
              <h3>{r.name}</h3>
              <div className="card-ejercicios">{r.exercises.length} ejercicio{r.exercises.length !== 1 ? 's' : ''}</div>
              <div className="card-musc">{muscles.map(m => <span key={m} className="musc-span">{m}</span>)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}