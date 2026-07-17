import React, { useState } from 'react';
import { ChevronLeft, Trash2, X, Dumbbell } from 'lucide-react';
import { formatElapsed } from '../utils/time';

export default function HistorialDetalle({ entry, onBack, onDelete }) {
  const [gifPreview, setGifPreview] = useState(null);
  const [gifFailedIds, setGifFailedIds] = useState(new Set());

  if (!entry) return null;
  const dt = new Date(entry.date);
  const dateStr = dt.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const markGifFailed = (key) => {
    setGifFailedIds(prev => new Set(prev).add(key));
  };

  return (
    <>
      <div className="header-cont">
        <div className="btn" onClick={onBack}><ChevronLeft size={20} /></div>
        {onDelete && (
          <div className="btn danger" title="Eliminar entrenamiento" onClick={() => { onDelete(); onBack(); }}>
            <Trash2 size={18} />
          </div>
        )}
      </div>
      <div className="page-cont">
        <h1 className='header-titulo'>{entry.routineName}</h1>
        <div className="header-sub" style={{ marginBottom: 16, textTransform: 'capitalize' }}>{dateStr}</div>
        <div className="historial-stats" style={{ marginBottom: 20 }}>
          <div>Duración<b>{formatElapsed(entry.durationSec * 1000)}</b></div>
          <div>Series<b>{entry.totalSets}</b></div>
          <div>Volumen<b>{Math.round(entry.totalVolume)} kg</b></div>
        </div>
        {entry.exercises.map((ex, i) => {
          const nombre = ex.nombre ?? ex.name;
          const musculo = ex.parteDelCuerpo ?? ex.muscle;
          const gif = ex.gif ?? ex.gifUrl;
          const gifFailed = gifFailedIds.has(i);

          return (
            <div key={i} className="rutina-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {gif && !gifFailed && (
                  <img
                    src={gif}
                    alt={nombre}
                    loading="lazy"
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', cursor: 'zoom-in', flexShrink: 0 }}
                    onClick={() => setGifPreview({ url: gif, nombre })}
                    onError={() => markGifFailed(i)}
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
                <div>
                  <h4 style={{ margin: 0 }}>{nombre}</h4>
                  {musculo && <div className="musculo">{musculo}</div>}
                </div>
              </div>
              {ex.sets.map((s, j) => (
                <div key={j} className="historial-detalle"><span>Serie {j + 1}</span><span>{s.weight || 0} kg × {s.reps || 0} reps</span></div>
              ))}
            </div>
          );
        })}
      </div>

      {gifPreview && (
        <div className="modal-overlay" onClick={() => setGifPreview(null)}>
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mini-btn"
              style={{ position: 'absolute', top: -14, right: -14, background: '#fff' }}
              onClick={() => setGifPreview(null)}
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
            <img
              src={gifPreview.url}
              alt={gifPreview.nombre}
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, display: 'block' }}
            />
          </div>
        </div>
      )}
    </>
  );
}