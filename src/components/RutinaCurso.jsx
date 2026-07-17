import React from 'react';
import { X, Check, Plus, Copy, Repeat, Pencil, ChevronsUpDown, ChevronsDownUp, Pause, Play, Award, Dumbbell, Eye } from 'lucide-react';
import { formatElapsed } from '../utils/time';
import TiempoDescanso from './TiempoDescanso';
import EjercicioModal from './ejercicioModal';
import "./rutina.css"

export default function RutinaCurso({
  session, restTimer, restDefault, history = [],
  onCancel, onToggleSet, onUpdateField, onAddSet, onFinish,
  onSetRestDefault, onAdjustRest, onTogglePause, onDismissRest,
  onDuplicateLastSet, onOpenPicker, onToggleSessionPause, onEditExercise,
  pickerOpen, allExercises, pickerQuery, onPickerQueryChange, pickerSelection,
  onTogglePick, onCreateCustomExercise, onConfirmPicker, onClosePicker
}) {
  const s = session;
  const [collapsedIds, setCollapsedIds] = React.useState(new Set());
  const [, forceTick] = React.useState(0);
  const [gifPreview, setGifPreview] = React.useState(null);
  const [gifFailedIds, setGifFailedIds] = React.useState(new Set());

  React.useEffect(() => {
    if (s?.paused) return;
    const id = setInterval(() => forceTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [s?.paused]);

  if (!s) return null;

  const elapsedMs = (s.paused ? s.pausedAt : Date.now()) - s.startedAt - (s.pausedMs || 0);

  const allCollapsed = s.exercises.length > 0 && s.exercises.every((ex, exi) => collapsedIds.has(ex.id ?? exi));

  const toggleAll = () => {
    setCollapsedIds(allCollapsed ? new Set() : new Set(s.exercises.map((ex, exi) => ex.id ?? exi)));
  };

  const toggleOne = (key) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const markGifFailed = (key) => {
    setGifFailedIds(prev => new Set(prev).add(key));
  };

  const records = React.useMemo(() => {
    const map = new Map();
    history.forEach(entry => {
      entry.exercises.forEach(ex => {
        const name = ex.nombre ?? ex.name;
        ex.sets.forEach(set => {
          const w = +set.weight || 0;
          const r = +set.reps || 0;
          if (w <= 0) return;
          const prev = map.get(name);
          if (!prev || w > prev.weight || (w === prev.weight && r > prev.reps)) {
            map.set(name, { weight: w, reps: r });
          }
        });
      });
    });
    return map;
  }, [history]);

  return (
    <>
      <div className="header-cont">
        <div className="btn" onClick={onCancel}><X size={18} /></div>
        <div>
          <div className="tiempo" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            {formatElapsed(elapsedMs)}
            {onToggleSessionPause && (
              <span className={`mini-btn`} title={s.paused ? 'Reanudar' : 'Pausar'} onClick={onToggleSessionPause}>
                {s.paused ? <Play size={13} /> : <Pause size={13} />}
              </span>
            )}
          </div>
          <div className="header-sub">{s.paused ? ' · Pausado' : ''}</div>
        </div>
        {s.exercises.length > 0 ? (
          <div className="btn" title={allCollapsed ? 'Expandir todo' : 'Colapsar todo'} onClick={toggleAll}>
            {allCollapsed ? <ChevronsUpDown size={16} /> : <ChevronsDownUp size={16} />}
          </div>
        ) : <div style={{ width: 40 }}></div>}
      </div>

      <div className="page-cont top">
        {s.exercises.map((ex, exi) => {
          const key = ex.id ?? exi;
          const isCollapsed = collapsedIds.has(key);
          const nombre = ex.nombre ?? ex.name;
          const musculo = ex.parteDelCuerpo ?? ex.muscle;
          const gif = ex.gif ?? ex.gifUrl;
          const gifFailed = gifFailedIds.has(key);

          return (
            <div key={key} className="rutina-card">
              <div className="ejercicio-header" style={{ cursor: 'pointer' }}>



                <div className='sub-cont-wrap' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {gif && !gifFailed && (
                    <img
                      src={gif}
                      alt={nombre}
                      loading="lazy"
                      className="ejercicio-gif-thumb"
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', cursor: 'zoom-in', flexShrink: 0 }}
                      title="Ver gif"
                      onClick={() => setGifPreview({ src: gif, nombre })}
                      onError={() => markGifFailed(key)}
                    />
                  )}
                  {(!gif || gifFailed) && (
                    <div
                      className="ejercicio-placeholder"
                      style={{ width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Dumbbell size={20} strokeWidth={1.5} />
                    </div>
                  )}

                  <div onClick={() => toggleOne(key)} style={{ flex: 1 }}>
                    <div className='sub-cont'>
                      <h4>{nombre}</h4>
                      {records.has(nombre) && (
                        <div className="record-badge">
                          <Award size={12} /> {records.get(nombre).weight}kg × {records.get(nombre).reps}
                        </div>
                      )}
                    </div>
                    <div className="musculo">
                      {musculo}
                      {ex.rest ? (
                        <span className="descanso-badge">{ex.rest}s</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="ejercicio-acciones curso" onClick={e => e.stopPropagation()}>
                  {gif && (
                    <button className="mini-btn" title="Ver gif" onClick={() => setGifPreview({ src: gif, nombre })}>
                      <Eye size={14} />
                    </button>
                  )}
                  {onEditExercise && (
                    <button className="mini-btn" title="Editar ejercicio" onClick={() => onEditExercise(exi)}>
                      <Pencil size={14} />
                    </button>
                  )}
                  {onOpenPicker && (
                    <button className="mini-btn" title="Cambiar ejercicio" onClick={() => onOpenPicker(exi)}>
                      <Repeat size={14} />
                    </button>
                  )}
                </div>
              </div>

              {
                !isCollapsed && (
                  <div className="ejercicio-inputs">
                    <div className="ejercicio-inputs-header">
                      <span>Kg</span>
                      <span>Reps</span>
                    </div>
                    {ex.sets.map((set, si) => (
                      <div key={set.id ?? si} className="ejercicio-inputs-cont">
                        <span className="ejercicio-num">{si + 1}</span>
                        <input type="text" inputMode="decimal" value={set.weight} placeholder="0" onChange={e => onUpdateField(exi, si, 'weight', e.target.value)} />
                        <input type="text" inputMode="numeric" value={set.reps} placeholder="0" onChange={e => onUpdateField(exi, si, 'reps', e.target.value)} />
                        <div className='check-cont'>
                          <button title='Terminado' className={`check ${set.done ? 'done' : ''}`} onClick={() => onToggleSet(exi, si)}>
                            {<Check size={15} style={{ position: "relative", right: 1 }} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {ex.sets.length > 0 && onDuplicateLastSet && (
                        <button className="btns agregar" onClick={() => onDuplicateLastSet(exi)}><Copy size={12} /> Duplicar</button>
                      )}
                    </div>
                  </div>
                )
              }
            </div>
          );
        })}
        <button className="btns primario" style={{ marginTop: 6, marginBottom: restTimer ? 110 : 0 }} onClick={onFinish}>Finalizar rutina</button>
      </div >


      {
        gifPreview && (
          <div className="modal-overlay" onClick={() => setGifPreview(null)}>
            <div className="gif-preview-cont" onClick={e => e.stopPropagation()}>
              <button className="mini-btn gif-preview-close" title='Cerrar' onClick={() => setGifPreview(null)}>
                <X size={18} />
              </button>
              <img src={gifPreview.src} alt={gifPreview.nombre} className="gif-preview-img" />
              <div className="gif-preview-title">{gifPreview.nombre}</div>
            </div>
          </div>
        )
      }

      {
        pickerOpen && (
          <EjercicioModal
            isOpen={pickerOpen}
            onClose={onClosePicker}
            onSelect={onConfirmPicker}
          />
        )
      }

    </>
  );
}