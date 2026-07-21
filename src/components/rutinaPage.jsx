import React, { useMemo, useState } from 'react';
import { Plus, Bell, Dumbbell, ChevronRight, Download, Upload } from 'lucide-react';
import "./rutina.css"

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export default function RutinaPage({ routines = [], onNewRoutine, onSelectRoutine, onExport, onImport }) {
  const hoy = new Date().getDay();
  const [showHoy, setShowHoy] = useState(false);

  const rutinasDeHoy = useMemo(() => {
    return (routines ?? []).filter(r => r.days?.includes(hoy));
  }, [routines, hoy]);

  return (
    <>
      <div className="header-cont">
        <div>
          <h1 className='header-titulo'>Rutinas</h1>
          <div className="header-sub">{routines.length} guardada{routines.length !== 1 ? 's' : ''}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <button
            className="btn export"
            disabled={routines.length === 0}
            title={routines.length === 0 ? "No hay rutinas para exportar" : "Exportar"}
            onClick={() => routines.length > 0 && onExport()}
            
          >
            <Upload size={18} />
          </button>
          <div className="btn" title="Importar" onClick={onImport}><Download size={18} /></div>

          {rutinasDeHoy.length > 0 && (
            <>
              <div
                className={`btn ${showHoy ? 'activo' : ''}`}
                title='Rutina de hoy'
                style={{ position: 'relative' }}
                onClick={() => setShowHoy(v => !v)}
              >
                <Bell size={20} />
                <span className="notif-dot" />
              </div>
              {showHoy && (
                <>
                  <div className="notif-backdrop" onClick={() => setShowHoy(false)} />
                  <div className="notif-pop" onClick={(e) => e.stopPropagation()}>

                    <div className="notif-pop-head">
                      <div className="notif-pop-icon"><Bell size={14} /></div>
                      <div>
                        <div className="notif-pop-title">Hoy toca</div>
                        <div className="notif-pop-sub">
                          {rutinasDeHoy.length} rutina{rutinasDeHoy.length !== 1 ? 's' : ''} programada{rutinasDeHoy.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="notif-pop-list">
                      {rutinasDeHoy.map(r => (
                        <div
                          key={r.id}
                          title="Ir a la rutina"
                          className="notif-pop-item"
                          onClick={() => { setShowHoy(false); onSelectRoutine(r.id); }}
                        >
                          <div className="notif-pop-item-icon"><Dumbbell size={14} /></div>
                          <div className="notif-pop-item-info">
                            <span className="notif-pop-title">{r.name}</span>
                            <span className="notif-pop-sub">
                              {r.exercises.length} ejercicio{r.exercises.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <ChevronRight size={15} className="notif-pop-item-chev" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          <div className="btn acento" title='Agregar rutina' onClick={onNewRoutine}><Plus size={20} /></div>
        </div>
      </div>

      <div className="page-cont">
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
          const esHoy = r.days?.includes(hoy);
          return (
            <div
              key={r.id}
              className="rutina-card"
              role="button"
              tabIndex={0}
              onClick={() => onSelectRoutine(r.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectRoutine(r.id)}
              style={{ position: 'relative' }}
            >
              {esHoy && <span className="dot-hoy" title="Hoy toca" />}
              <h3>{r.name}</h3>
              <div className="card-ejercicios">{r.exercises.length} ejercicio{r.exercises.length !== 1 ? 's' : ''}</div>



              <div style={{ display: "flex", gap: "10px" }}>

                {r.days?.length > 0 && (
                  <div className="card-dias">
                    {DIAS.map((d, i) => (
                      <span
                        key={i}
                        className={`card-dia-chip ${r.days.includes(i) ? 'activo' : 'no'} ${i === hoy ? 'es-hoy' : ''}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-musc">{muscles.map(m => <span key={m} className="musc-span">{m}</span>)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
