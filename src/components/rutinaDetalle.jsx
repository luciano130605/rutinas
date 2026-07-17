import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, MoreVertical, Filter, ChevronsUpDown, ChevronsDownUp, Check, X, Bell, BellOff } from 'lucide-react';
import "./rutina.css"
import { sileo } from 'sileo';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


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

  if (!routine) return null;
  const totalSets = routine.exercises.reduce((s, e) => s + e.sets.length, 0);

  const muscles = useMemo(() => {
    return Array.from(new Set(routine.exercises.map(ex => ex.muscle).filter(Boolean)));
  }, [routine.exercises]);

  const exercises = useMemo(() => {
    if (!muscleFilter) return routine.exercises;
    return routine.exercises.filter(ex => ex.muscle === muscleFilter);
  }, [routine.exercises, muscleFilter]);

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
      <div className="header-cont">
        <div className="btn" title='Volver' onClick={onBack}><ChevronLeft size={20} /></div>
        <div className="btn" title='Opciones' onClick={onToggleKebab}><MoreVertical size={18} /></div>
      </div>
      {kebabOpen && (
        <div className="kebab-menu">
          <div className="item" onClick={onEdit}>Editar rutina</div>
          <div className="item" onClick={() => handleRenombrarRapido(routine.id, routine.name)}>Renombrar rápido</div>
          <div className="item" onClick={onDuplicate}>Duplicar rutina</div>
          <div className="item" onClick={() => onShare(routine.id)}>Compartir</div>
          <div className="item" onClick={() => { onToggleKebab(); onCopyText(routine.id); }}>Copiar como texto</div>
          <div className="item danger" onClick={onDelete}>Eliminar rutina</div>
        </div>
      )}
      <div className="page-cont top">
        <h1>{routine.name}</h1>


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
                <div
                  className="kebab-filter"

                >
                  <div onClick={() => selectMuscle(null)}>
                    <span className={`span-kebap todos ${!muscleFilter ? "select" : ""}`} >
                      Todos
                      {!muscleFilter && <Check size={14} />}
                    </span>
                  </div>
                  {muscles.map(m => (
                    <div key={m}

                      onClick={() => selectMuscle(m)}
                    >
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

              {!isCollapsed && ex.sets.map((s, i) => (
                <div key={s.id} className="card-ejercicios top">
                  <span>Serie {i + 1} </span>
                  <span>{s.weight || 0} kg × {s.reps || 0} reps</span>
                </div>
              ))}
            </div>
          );
        })}

        {exercises.length === 0 && (
          <div className="header-sub" style={{ marginTop: 20 }}>
            No hay ejercicios de "{muscleFilter}" en esta rutina.
          </div>
        )}

        <div style={{ height: 10 }}></div>
        <button className="btns primario" onClick={onStartSession}>Empezar rutina</button>
      </div >

      {statsOpen && (
        <EstadisticasModal routine={routine} history={history} onClose={() => setStatsOpen(false)} />
      )}

    </>
  );
}