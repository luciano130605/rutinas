import React, { useState } from 'react';
import { X, Check, ChevronUp, ChevronDown, Repeat, ChevronsUpDown, GripVertical, Timer, Plus, Copy, ChevronsDownUp } from 'lucide-react';
import { openDescansoToast } from './descansoToastModal';
import "./rutina.css"
import EjercicioModal from './ejercicioModal';

export default function RutinaCrear({
  draft, onChangeName, onMoveExercise, onRemoveExercise, onAddSet, onRemoveSet, onUpdateSetField,
  onOpenPicker, onSave, onCancel, onDeleteRoutine,
  onDuplicateLastSet, onReorderExercise, onUpdateRest,
  pickerOpen, pickerSelection, onConfirmPicker, onClosePicker,
  mode = 'full'
}) {
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  if (!draft) return null;
  const d = draft;
  const isSingle = mode === 'single';

  const allCollapsed = d.exercises.length > 0 && d.exercises.every(ex => collapsedIds.has(ex.id));

  const toggleAll = () => {
    setCollapsedIds(allCollapsed ? new Set() : new Set(d.exercises.map(ex => ex.id)));
  };

  const toggleOne = (id) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDragStart = (exi) => (e) => {
    setDragIndex(exi);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (exi) => (e) => {
    e.preventDefault();
    if (exi !== dragOverIndex) setDragOverIndex(exi);
  };

  const handleDrop = (exi) => (e) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== exi) {
      onReorderExercise(dragIndex, exi);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const openRestToast = (exi) => {
    const ex = d.exercises[exi];
    openDescansoToast({
      exerciseName: ex.name,
      initialValue: ex.rest,
      onConfirm: (value) => onUpdateRest(exi, value),
    });
  };

  const openRestToastAll = () => {
    openDescansoToast({
      exerciseName: 'todos los ejercicios',
      initialValue: d.exercises[0]?.rest,
      onConfirm: (value) => {
        d.exercises.forEach((_, exi) => onUpdateRest(exi, value));
      },
    });
  };

  return (
    <>
      <div className="header-cont">
        <div className="btn" onClick={onCancel}><X size={18} /></div>
        <div className='titulo'>
          {isSingle ? 'Editar ejercicio' : (d.id ? 'Editar rutina' : 'Nueva rutina')}
        </div>
        <div className="btn acento" title='Guardar' onClick={onSave}><Check size={18} /></div>
      </div>
      <div className="page-cont top">
        {!isSingle && (
          <div className="crear-input" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Nombre de la rutina</label>
              <input type="text" placeholder="Ej. Lunes — Pecho y hombros" value={d.name} onChange={e => onChangeName(e.target.value)} />
            </div>
            {d.exercises.length > 0 && (
              <div className="btn" style={{ marginLeft: "5px" }} title='Descanso para todos' onClick={openRestToastAll}>
                <Timer size={16} />
              </div>
            )}
            {d.exercises.length > 0 && (
              <div className="btn" style={{ marginLeft: "5px" }} title={allCollapsed ? 'Expandir todo' : 'Colapsar todo'} onClick={toggleAll}>
                {allCollapsed ? <ChevronsUpDown size={16} /> : <ChevronsDownUp size={16} />}
              </div>
            )}
          </div>
        )}

        {d.exercises.map((ex, exi) => {
          const isCollapsed = collapsedIds.has(ex.id);
          return (
            <div
              key={ex.id}
              className={`ejercicio-cont`}
              onDrop={handleDrop(exi)}
              onDragEnd={handleDragEnd}
            >
              <div className="ejercicio-header" onClick={() => toggleOne(ex.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div>
                      <h4>{ex.name}</h4>
                      <div className="musculo">
                        {ex.muscle}
                        {ex.rest ? (
                          <span className="descanso-badge">
                            <Timer size={11} /> {ex.rest}s
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ejercicio-acciones" onClick={e => e.stopPropagation()}>
                  {!isSingle && exi > 0 && <div className="mini-btn" onClick={() => onMoveExercise(exi, -1)}><ChevronUp size={14} /></div>}
                  {!isSingle && exi < d.exercises.length - 1 && <div className="mini-btn" title='Mover' onClick={() => onMoveExercise(exi, 1)}><ChevronDown size={14} /></div>}
                  <div
                    className={`mini-btn`}
                    title={ex.rest ? `Descanso: ${ex.rest}s` : 'Configurar descanso'}
                    onClick={() => openRestToast(exi)}
                  >
                    <Timer size={14} />
                  </div>
                  <div className="mini-btn" title='Reemplazar ejercicio' onClick={() => onOpenPicker(exi)}><Repeat size={14} /></div>
                  {!isSingle && <div className="mini-btn danger" title='Eliminar' onClick={() => onRemoveExercise(exi)}><X size={14} /></div>}
                </div>
              </div>

              {!isCollapsed && (
                <div className="ejercicio-inputs">
                  {(() => {
                    const isBodyweight = ex.equipment === 'P. corporal';
                    return (
                      <>
                        <div className="ejercicio-inputs-header">
                          <span></span>
                          {!isBodyweight && <span>Kg</span>}
                          <span>Reps</span>
                          <span></span>
                        </div>
                        {ex.sets.map((s, si) => (
                          <div key={s.id} className="ejercicio-inputs-header">
                            <span className="ejercicio-num">{si + 1}</span>
                            {!isBodyweight && (
                              <input
                                type="text"
                                inputMode="decimal"
                                value={s.weight}
                                placeholder="0"
                                onChange={e =>
                                  onUpdateSetField(exi, si, 'weight', e.target.value.replace(',', '.'))
                                }
                              />
                            )}
                            <input
                              type="text"
                              inputMode="numeric"
                              value={s.reps}
                              placeholder="0"
                              onChange={e => onUpdateSetField(exi, si, 'reps', e.target.value)}
                            />
                            <button className="check right" onClick={() => onRemoveSet(exi, si)}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btns agregar" onClick={() => onAddSet(exi)}><Plus size={12} /> Añadir serie</button>
                    {ex.sets.length > 0 && (
                      <button className="btns agregar" onClick={() => onDuplicateLastSet(exi)}><Copy size={12} /> Duplicar</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!isSingle && (
          <button className="btns agregar" style={{ marginTop: 6 }} onClick={() => onOpenPicker()}>+ Añadir ejercicio</button>
        )}
        {!isSingle && d.exercises.length > 0 && (
          <button className="btns eliminar" style={{ marginTop: 24 }} onClick={onDeleteRoutine}>Eliminar rutina</button>
        )}
      </div>

      {pickerOpen && (
        <EjercicioModal
          isOpen={pickerOpen}
          onClose={onClosePicker}
          onSelect={(exercise) => {
            onConfirmPicker(exercise);
            onClosePicker();
          }}
          apiBaseUrl="https://j3prwv26-4000.brs.devtunnels.ms/api"
        />
      )}
    </>
  );
}
