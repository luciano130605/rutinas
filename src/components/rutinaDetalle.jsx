import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronDown, MoreVertical, Filter, ChevronsUpDown, ChevronsDownUp,
  Check, X, Bell, BellOff, TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';
import "./rutina.css"
import { sileo } from 'sileo';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Paleta fija para el indicador de volumen por músculo (no depende del tema)
const MUSCLE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];

function formatRelative(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} día${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years > 1 ? 's' : ''}`;
}

// Contenido de estadísticas compartido entre el sileo y el modal fallback
function StatsContent({ routine, lastEntry, muscleVolume, exerciseHistoryMap }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Última sesión</div>
        <div>
          {lastEntry
            ? `${formatRelative(lastEntry.date)} · ${lastEntry.totalSets} series · ${Math.round(lastEntry.totalVolume).toLocaleString('es-AR')} kg`
            : 'Sin sesiones registradas todavía'}
        </div>
      </div>

      {muscleVolume.length > 0 && (
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Volumen por músculo</div>
          <div style={{ display: 'flex', width: '90%', height: 6, borderRadius: 4, overflow: 'hidden' }}>
            {muscleVolume.map((mv, i) => (
              <div
                key={mv.muscle}
                title={`${mv.muscle}: ${Math.round(mv.pct)}%`}
                style={{ width: `${mv.pct}%`, background: MUSCLE_COLORS[i % MUSCLE_COLORS.length] }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            {muscleVolume.map((mv, i) => (
              <span key={mv.muscle} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: 0.85 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: MUSCLE_COLORS[i % MUSCLE_COLORS.length], display: 'inline-block'
                }} />
                {mv.muscle} · {Math.round(mv.pct)}%
              </span>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

// Fallback si sileo.action no puede mostrar este contenido (p.ej. layout demasiado rico para un toast)
function EstadisticasModal({ routine, history, onClose, lastEntry, muscleVolume, exerciseHistoryMap }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="sileo-cont"
        style={{ maxWidth: 380, width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: 20, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Estadísticas · {routine.name}</h3>
          <button type="button" className="btn" onClick={onClose} title="Cerrar">
            <X size={16} />
          </button>
        </div>
        <StatsContent
          routine={routine}
          lastEntry={lastEntry}
          muscleVolume={muscleVolume}
          exerciseHistoryMap={exerciseHistoryMap}
        />
      </div>
    </div>
  );
}

export default function RutinaDetalle({
  routine, kebabOpen, onToggleKebab, onBack, onEdit, onDuplicate, onDelete, onStartSession,
  onRename, onShare, onCopyText, history, reminder, onSaveReminder, onClearReminder
}) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const filterRef = useRef(null);
  const kebabRef = useRef(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  useEffect(() => {
    if (!kebabOpen) return;
    const handleClickOutside = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        onToggleKebab();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [kebabOpen, onToggleKebab]);

  if (!routine) return null;
  const totalSets = routine.exercises.reduce((s, e) => s + e.sets.length, 0);

  const muscles = useMemo(() => {
    return Array.from(new Set(routine.exercises.map(ex => ex.muscle).filter(Boolean)));
  }, [routine.exercises]);

  const exercises = useMemo(() => {
    if (!muscleFilter) return routine.exercises;
    return routine.exercises.filter(ex => ex.muscle === muscleFilter);
  }, [routine.exercises, muscleFilter]);

  const lastEntry = useMemo(() => {
    return history
      .filter(h => h.routineId === routine.id)
      .sort((a, b) => b.date - a.date)[0] || null;
  }, [history, routine.id]);

  const muscleVolume = useMemo(() => {
    const counts = {};
    let total = 0;
    routine.exercises.forEach(ex => {
      const m = ex.muscle || 'Sin músculo';
      counts[m] = (counts[m] || 0) + ex.sets.length;
      total += ex.sets.length;
    });
    return Object.entries(counts)
      .map(([muscle, count]) => ({ muscle, count, pct: total ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [routine.exercises]);

  const exerciseHistoryMap = useMemo(() => {
    const routineHistory = history
      .filter(h => h.routineId === routine.id)
      .sort((a, b) => b.date - a.date);
    const map = {};
    routine.exercises.forEach(ex => {
      const occurrences = [];
      for (const entry of routineHistory) {
        const match = entry.exercises.find(e => e.name === ex.name);
        if (match) {
          const volume = match.sets.reduce((s, st) => s + (+st.weight || 0) * (+st.reps || 0), 0);
          occurrences.push({ date: entry.date, volume });
          if (occurrences.length === 2) break;
        }
      }
      map[ex.id] = occurrences;
    });
    return map;
  }, [history, routine.id, routine.exercises]);

  const toggleCollapse = (id) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRenombrarRapido = (routineId, currentName) => {
    onToggleKebab();
    const nameRef = { current: currentName };
    let toastId;

    toastId = sileo.action({
      title: "Renombrar rutina",
      duration: null,
      description: (
        <input
          type="text"
          className='input-sileo'
          defaultValue={currentName}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => { nameRef.current = e.target.value; }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              onRename(routineId, nameRef.current);
              sileo.dismiss(toastId);
            }
          }}
        />
      ),
      button: {
        title: "Guardar",
        className: "btns agregar",
        onClick: () => {
          onRename(routineId, nameRef.current);
          sileo.dismiss(toastId);
        },
      },
      styles: {
        container: "sileo-cont",
        title: "sileo-title",
        description: "sileo-description",
        button: "btns agregar sileo",
      },
    });
  };

  // NUEVO: estadísticas — intenta abrir un sileo.action; si falla, cae al modal
  const handleOpenStats = () => {
    onToggleKebab();
    let toastId;
    try {
      toastId = sileo.action({
        title: `Estadísticas · ${routine.name}`,
        duration: null,
        description: (
          <StatsContent
            routine={routine}
            lastEntry={lastEntry}
            muscleVolume={muscleVolume}
            exerciseHistoryMap={exerciseHistoryMap}
          />
        ),
        button: {
          title: "Cerrar",
          className: "btns agregar",
          onClick: () => sileo.dismiss(toastId),
        },
        styles: {
          container: "sileo-cont",
          title: "sileo-title",
          description: "sileo-description",
          button: "btns agregar sileo",
        },
      });
      if (!toastId) throw new Error('sileo.action no devolvió id');
    } catch (e) {
      setStatsOpen(true);
    }
  };

  const toggleCollapseAll = (e) => {
    e.stopPropagation();
    if (allCollapsed) {
      setCollapsed(new Set());
      setAllCollapsed(false);
    } else {
      setCollapsed(new Set(routine.exercises.map(ex => ex.id)));
      setAllCollapsed(true);
    }
  };

  const selectMuscle = (m) => {
    setMuscleFilter(m);
    setFilterOpen(false);
  };

  return (
    <>
      <div className="header-cont" ref={kebabRef}>
        <div className="btn" title='Volver' onClick={onBack}><ChevronLeft size={20} /></div>
        <div className="btn" title='Opciones' onClick={onToggleKebab}><MoreVertical size={18} /></div>
        {kebabOpen && (
          <div className="kebab-menu">
            <div className="item" onClick={onEdit}>Editar rutina</div>
            <div className="item" onClick={() => handleRenombrarRapido(routine.id, routine.name)}>Renombrar rápido</div>
            <div className="item" onClick={handleOpenStats}>
              Ver estadísticas
            </div>
            <div className="item" onClick={onDuplicate}>Duplicar rutina</div>
            <div className="item" onClick={() => onShare(routine.id)}>Compartir</div>
            <div className="item" onClick={() => { onToggleKebab(); onCopyText(routine.id); }}>Copiar como texto</div>
            <div className="item danger" onClick={onDelete}>Eliminar rutina</div>
          </div>
        )}
      </div>

      <div className="page-cont top">
        <h1>{routine.name}</h1>

        <div className="header-sub" style={{ marginTop: 2, marginBottom: 12 }}>
          {lastEntry
            ? `Última vez: ${formatRelative(lastEntry.date)} · ${lastEntry.totalSets} series`
            : 'Todavía no registraste ninguna sesión de esta rutina'}
        </div>



        <div
          className="header-sub"
          style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <span>
            {exercises.length} ejercicios · {exercises.reduce((s, e) => s + e.sets.length, 0)} series totales
            {muscleFilter ? ` · filtrado: ${muscleFilter}` : ''}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <button
              type="button"
              className="btn"
              title={allCollapsed ? "Expandir todo" : "Colapsar todo"}
              onClick={toggleCollapseAll}
            >
              {allCollapsed ? <ChevronsUpDown size={14} /> : <ChevronsDownUp size={14} />}
            </button>

            <div ref={filterRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="btn"
                title="Filtrar por músculo"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterOpen(v => !v);
                }}

              >
                <Filter size={14} />
              </button>

              {filterOpen && (
                <div className="kebab-filter">
                  <div onClick={() => selectMuscle(null)}>
                    <span className={`span-kebap todos ${!muscleFilter ? "select" : ""}`}>
                      Todos
                      {!muscleFilter && <Check size={14} />}
                    </span>
                  </div>
                  {muscles.map(m => (
                    <div key={m} onClick={() => selectMuscle(m)}>
                      <span className={`span-kebap todos ${muscleFilter === m ? "select" : ""}`}>
                        {m}
                        {muscleFilter === m && <Check size={14} />}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {exercises.map(ex => {
          const isCollapsed = collapsed.has(ex.id);
          const occurrences = exerciseHistoryMap[ex.id] || [];
          const last = occurrences[0];
          const prev = occurrences[1];
          const delta = last && prev ? last.volume - prev.volume : null;

          return (
            <div key={ex.id} className="rutina-card">
              <div
                className='rutina-card-cont'
                title={isCollapsed ? "Expandir" : "Colapsar"}
                onClick={() => toggleCollapse(ex.id)}
              >
                <div className='rutina-card-header'>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                      transition: "transform .15s ease"
                    }}
                  />
                  <h4 className='titulo-rutina'>{ex.name}</h4>
                </div>
                <span className='musc-span'>{ex.muscle}</span>
              </div>

              {last && (
                <div
                  className="header-sub"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, padding: '0 2px 6px', opacity: 0.85
                  }}
                >
                  <span>{formatRelative(last.date)} · {Math.round(last.volume).toLocaleString('es-AR')} kg</span>
                  {delta !== null && delta !== 0 && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      color: delta > 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {delta > 0 ? '+' : ''}{Math.round(delta)} kg
                    </span>
                  )}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isCollapsed ? '0fr' : '1fr',
                  transition: 'grid-template-rows .2s ease',
                }}
              >
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                  {ex.sets.map((s, i) => (
                    <div key={s.id} className="card-ejercicios top">
                      <span>Serie {i + 1} </span>
                      <span>{s.weight || 0} kg × {s.reps || 0} reps</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {exercises.length === 0 && (
          <div className="header-sub" style={{ marginTop: 20 }}>
            No hay ejercicios de "{muscleFilter}" en esta rutina.
          </div>
        )}

        <div style={{ height: 10 }}></div>
        <button className="btns primario fixed" onClick={onStartSession}>Empezar rutina</button>
      </div >

      {statsOpen && (
        <EstadisticasModal
          routine={routine}
          history={history}
          lastEntry={lastEntry}
          muscleVolume={muscleVolume}
          exerciseHistoryMap={exerciseHistoryMap}
          onClose={() => setStatsOpen(false)}
        />
      )}
    </>
  );
}
