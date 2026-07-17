import React from 'react';
import { Minus, Plus, X, Pause, Play } from 'lucide-react';
import { formatElapsed } from '../utils/time';
import { REST_PRESETS } from '../data/exercises';
import "./rutina.css"

export default function TiempoDescanso({ restTimer, restDefault, onSetRestDefault, onAdjustRest, onTogglePause, onDismiss }) {
  const rt = restTimer;
  const pct = rt.total > 0 ? Math.max(0, (rt.remaining / rt.total) * 100) : 0;
  const ended = rt.remaining <= 0;

  return (
    <div className="cont-tiempo">
        <div className="tiempo-header">
          <div className="tiempo-label">{ended ? 'Descanso terminado!' : 'Descanso'}</div>
          <div className={`tiempo-tiempo ${ended ? 'done' : ''}`}>{formatElapsed(rt.remaining * 1000)}</div>
        </div>
      <div className="tiempo-progreso-cont"><div className="tiempo-progreso-fill" style={{ width: `${pct}%` }}></div></div>
      <div className="tiempo-controles">
        <div className="tiempo-btn-add" title='Restar 15 segundos' onClick={() => onAdjustRest(-15)}><Minus size={16} /></div>
        <div className="tiempo-pausa" onClick={onTogglePause}>
          {rt.running ? <Pause size={14} /> : <Play size={14} />} {rt.running ? 'Pausar' : 'Reanudar'}
        </div>
        <div className="tiempo-btn-add" title='Agregar 15 segundos' onClick={() => onAdjustRest(15)}><Plus size={16} /></div>
        <div className="tiempo-btn-add danger" title='Cerrar' onClick={onDismiss}><X size={16} /></div>
      </div>
    </div>
  );
}
