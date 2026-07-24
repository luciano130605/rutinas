import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

import bodyFront from '/gifs/human-body-frontal.png'; // ajustá la ruta
import bodyBack from '/gifs/human-body.png';


const LABELS = {
    hombros: 'Hombros', pecho: 'Pecho', biceps: 'Bíceps', triceps: 'Tríceps',
    antebrazos: 'Antebrazos', abdomen: 'Abdomen', trapecio: 'Trapecio',
    espalda: 'Espalda', lumbares: 'Lumbares', gluteos: 'Glúteos',
    cuadriceps: 'Cuádriceps', isquiotibiales: 'Isquiotibiales', gemelos: 'Gemelos',
};

const REGIONS_FRONT = {
    hombros: [
        [[23, 17], [35, 16], [33, 26], [21, 25]],
        [[65, 16], [77, 17], [79, 25], [67, 26]],
    ],
    pecho: [[[34, 21], [66, 21], [63, 33], [37, 33]]],
    biceps: [
        [[15, 25], [27, 23], [26, 38], [12, 39]],
        [[73, 23], [85, 25], [88, 39], [74, 38]],
    ],
    antebrazos: [
        [[5, 39], [14, 38], [12, 53], [2, 51]],
        [[86, 38], [95, 39], [98, 51], [88, 53]],
    ],
    abdomen: [[[38, 33], [62, 33], [60, 45], [40, 45]]],
    cuadriceps: [
        [[37, 46], [50, 46], [49, 67], [36, 67]],
        [[50, 46], [63, 46], [64, 67], [51, 67]],
    ],
    gemelos: [
        [[39, 68], [48, 68], [47, 87], [40, 87]],
        [[52, 68], [61, 68], [60, 87], [53, 87]],
    ],
};

const REGIONS_BACK = {
    trapecio: [[[40, 15], [60, 15], [58, 26], [42, 26]]],
    hombros: [
        [[23, 17], [35, 16], [33, 26], [21, 25]],
        [[65, 16], [77, 17], [79, 25], [67, 26]],
    ],
    espalda: [[[35, 26], [65, 26], [62, 41], [38, 41]]],
    triceps: [
        [[15, 25], [27, 23], [26, 38], [12, 39]],
        [[73, 23], [85, 25], [88, 39], [74, 38]],
    ],
    lumbares: [[[40, 41], [60, 41], [59, 48], [41, 48]]],
    gluteos: [
        [[37, 48], [50, 48], [49, 59], [36, 59]],
        [[50, 48], [63, 48], [64, 59], [51, 59]],
    ],
    isquiotibiales: [
        [[37, 59], [49, 59], [48, 69], [36, 69]],
        [[51, 59], [63, 59], [64, 69], [52, 69]],
    ],
    gemelos: [
        [[39, 69], [48, 69], [47, 87], [40, 87]],
        [[52, 69], [61, 69], [60, 87], [53, 87]],
    ],
}; 

function fillFor(intensidad = 0) {
  const t = Math.max(0, Math.min(1, intensidad));
  const alpha = t <= 0 ? 0.1 : 0.18 + t * 0.62;
  return `color-mix(in srgb, var(--acento) ${Math.round(alpha * 100)}%, transparent)`;
}

function RegionOverlay({ regionKey, polygons, intensidades, onHover, debug }) {
    const val = intensidades?.[regionKey] ?? 0;
    return polygons.map((points, i) => (
        <div
            key={i}
            onMouseEnter={() => onHover?.(regionKey, val)}
            onMouseLeave={() => onHover?.(null)}
            style={{
                position: 'absolute',
                inset: 0,
                clipPath: `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(', ')})`,
                background: fillFor(val),
                outline: debug ? '1px dashed red' : 'none',
                transition: 'background .3s ease',
                cursor: debug ? 'crosshair' : 'default',
            }}
        />
    ));
}

function Cuerpo({ src, alt, regiones, intensidades, onHover, debug }) {
    const handleClick = (e) => {
        if (!debug) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
        const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
        console.log(`[${x}, ${y}]`);
    };

    return (
        <div style={{ position: 'relative', width: '100%', lineHeight: 0 }} onClick={handleClick}>
            <img src={src} alt={alt} style={{ width: '100%', display: 'block', userSelect: 'none' }} draggable={false} />
            {Object.entries(regiones).map(([regionKey, polygons]) => (
                <RegionOverlay
                    key={regionKey}
                    regionKey={regionKey}
                    polygons={polygons}
                    intensidades={intensidades}
                    onHover={onHover}
                    debug={debug}
                />
            ))}
        </div>
    );
}

export default function CuerpoMuscular({ intensidades = {}, vistaInicial = 'front', size = 320, debug = false }) {
    const [vista, setVista] = useState(vistaInicial);
    const [hover, setHover] = useState(null);

    const regionesActivas = vista === 'front' ? REGIONS_FRONT : REGIONS_BACK;
    const usadas = Object.keys(regionesActivas).filter(r => (intensidades[r] ?? 0) > 0.02);

    return (
        <div className="cuerpo-muscular-cont">
            <div className="cuerpo-muscular-head">
                <span className="header-sub" style={{ fontSize: 12 }}>
                    {hover ? `${LABELS[hover]} · ${Math.round((intensidades[hover] || 0) * 100)}%` : (vista === 'front' ? 'Vista frontal' : 'Vista posterior')}
                </span>
                <button
                    type="button"
                    className="mini-btn"
                    title={vista === 'front' ? 'Ver espalda' : 'Ver frente'}
                    onClick={() => setVista(v => (v === 'front' ? 'back' : 'front'))}
                >
                    <RotateCcw size={13} />
                </button>
            </div>

            <div style={{ width: '100%', maxWidth: size, margin: '0 auto' }}>
                {vista === 'front'
                    ? <Cuerpo src={bodyFront} alt="Vista frontal" regiones={REGIONS_FRONT} intensidades={intensidades} onHover={setHover} debug={debug} />
                    : <Cuerpo src={bodyBack} alt="Vista posterior" regiones={REGIONS_BACK} intensidades={intensidades} onHover={setHover} debug={debug} />}
            </div>

            {usadas.length > 0 && (
                <div className="cuerpo-muscular-legend">
                    {usadas
                        .sort((a, b) => (intensidades[b] || 0) - (intensidades[a] || 0))
                        .map(r => (
                            <span key={r} className="cuerpo-muscular-chip">
                                <span className="cuerpo-muscular-dot" style={{ background: fillFor(intensidades[r]) }} />
                                {LABELS[r]}
                            </span>
                        ))}
                </div>
            )}
        </div>
    );
}
const MUSCLE_MAP = [
    { test: /pecho|pectoral/i, regiones: { pecho: 1 } },
    { test: /espalda alta|dorsal|lat/i, regiones: { espalda: 1 } },
    { test: /espalda baja|lumbar/i, regiones: { lumbares: 1 } },
    { test: /espalda/i, regiones: { espalda: 0.7, lumbares: 0.3 } },
    { test: /trapecio|trap/i, regiones: { trapecio: 1 } },
    { test: /hombro|deltoide/i, regiones: { hombros: 1 } },
    { test: /b[ií]ceps/i, regiones: { biceps: 1 } },
    { test: /tr[ií]ceps/i, regiones: { triceps: 1 } },
    { test: /antebrazo/i, regiones: { antebrazos: 1 } },
    { test: /brazo/i, regiones: { biceps: 0.5, triceps: 0.5 } },
    { test: /abdomen|abdominal|core/i, regiones: { abdomen: 1 } },
    { test: /gl[uú]teo/i, regiones: { gluteos: 1 } },
    { test: /isquio|femoral/i, regiones: { isquiotibiales: 1 } },
    { test: /cu[aá]driceps/i, regiones: { cuadriceps: 1 } },
    { test: /pierna/i, regiones: { cuadriceps: 0.5, isquiotibiales: 0.3, gluteos: 0.2 } },
    { test: /gemelo|pantorrilla/i, regiones: { gemelos: 1 } },
];

function normalizeMuscle(nombreLibre = '') {
    const match = MUSCLE_MAP.find(m => m.test.test(nombreLibre));
    return match ? match.regiones : null;
}

export function calcularIntensidadesMusculares(exercises = []) {
    const cargaPorRegion = {};

    exercises.forEach(ex => {
        const musculo = ex.parteDelCuerpo ?? ex.muscle ?? '';
        const regiones = normalizeMuscle(musculo);
        if (!regiones) return;

        const setsHechas = (ex.sets || []).filter(st => st.done);
        if (setsHechas.length === 0) return;

        const cargaEjercicio = setsHechas.reduce((acc, st) => {
            const w = +st.weight || 0;
            const r = +st.reps || 0;
            // sin peso (ejercicio con el propio cuerpo) igual suma, con menor peso relativo
            return acc + (w > 0 ? w * r : r * 0.5);
        }, 0);

        Object.entries(regiones).forEach(([region, peso]) => {
            cargaPorRegion[region] = (cargaPorRegion[region] || 0) + cargaEjercicio * peso;
        });
    });

    const max = Math.max(0, ...Object.values(cargaPorRegion));
    if (max === 0) return {};

    const intensidades = {};
    Object.entries(cargaPorRegion).forEach(([region, carga]) => {
        // raíz cuadrada para que la escala visual no quede dominada por un solo grupo
        intensidades[region] = Math.sqrt(carga / max);
    });
    return intensidades;
}
