import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * CuerpoMuscular
 * ---------------
 * Silueta humana (frente / espalda) que pinta cada grupo muscular según
 * cuánto se usó en la sesión. Pensado para integrarse con las clases y
 * variables CSS que ya usa el resto de la app (var(--acento), var(--borde), etc).
 *
 * Props:
 *  - intensidades: { [regionKey]: number } valores 0..1 (0 = no trabajado, 1 = máximo de la sesión)
 *  - vistaInicial: 'front' | 'back' (default 'front')
 *  - size: alto en px del SVG (default 320)
 *
 * Regiones soportadas (regionKey): hombros, pecho, biceps, triceps, antebrazos,
 * abdomen, trapecio, espalda, lumbares, gluteos, cuadriceps, isquiotibiales, gemelos
 */

const REGIONES_FRONT = ['hombros', 'pecho', 'biceps', 'antebrazos', 'abdomen', 'cuadriceps', 'gemelos'];
const REGIONES_BACK = ['trapecio', 'hombros', 'espalda', 'triceps', 'lumbares', 'gluteos', 'isquiotibiales', 'gemelos'];

const LABELS = {
    hombros: 'Hombros',
    pecho: 'Pecho',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    antebrazos: 'Antebrazos',
    abdomen: 'Abdomen',
    trapecio: 'Trapecio',
    espalda: 'Espalda',
    lumbares: 'Lumbares',
    gluteos: 'Glúteos',
    cuadriceps: 'Cuádriceps',
    isquiotibiales: 'Isquiotibiales',
    gemelos: 'Gemelos',
};

// Opacidad de relleno según intensidad 0..1 (0 = casi invisible, 1 = accento pleno)
function fillFor(intensidad = 0) {
    const t = Math.max(0, Math.min(1, intensidad));
    const alpha = t <= 0 ? 0.08 : 0.16 + t * 0.74;
    return `color-mix(in srgb, var(--acento) ${Math.round(alpha * 100)}%, transparent)`;
}

function Region({ regionKey, intensidades, children, onHover }) {
    const val = intensidades?.[regionKey] ?? 0;
    return (
        <g
            style={{ transition: 'fill .3s ease', cursor: 'default' }}
            fill={fillFor(val)}
            stroke="var(--acento)"
            strokeOpacity={val > 0 ? 0.5 : 0.15}
            strokeWidth={1}
            onMouseEnter={() => onHover?.(regionKey, val)}
            onMouseLeave={() => onHover?.(null)}
        >
            {children}
        </g>
    );
}

function CuerpoFrente({ intensidades, onHover }) {
    return (
        <svg viewBox="0 0 220 420" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <g fill="var(--fondo)" stroke="var(--borde)" strokeWidth="1.2">
                <circle cx="110" cy="32" r="22" />
                <rect x="100" y="50" width="20" height="16" rx="6" />
                <path d="M70,66 Q110,50 150,66 L158,120 Q110,140 62,120 Z" />
                <rect x="46" y="108" width="20" height="66" rx="10" />
                <rect x="154" y="108" width="20" height="66" rx="10" />
                <rect x="42" y="168" width="18" height="58" rx="8" />
                <rect x="160" y="168" width="18" height="58" rx="8" />
                <rect x="88" y="120" width="44" height="80" rx="14" />
                <rect x="70" y="196" width="34" height="98" rx="14" />
                <rect x="116" y="196" width="34" height="98" rx="14" />
                <rect x="72" y="292" width="30" height="70" rx="12" />
                <rect x="118" y="292" width="30" height="70" rx="12" />
                <rect x="76" y="360" width="24" height="14" rx="5" />
                <rect x="120" y="360" width="24" height="14" rx="5" />
            </g>

            {/* regiones coloreables */}
            <Region regionKey="hombros" intensidades={intensidades} onHover={onHover}>
                <ellipse cx="60" cy="78" rx="17" ry="15" />
                <ellipse cx="160" cy="78" rx="17" ry="15" />
            </Region>

            <Region regionKey="pecho" intensidades={intensidades} onHover={onHover}>
                <path d="M76,80 Q110,72 144,80 L140,118 Q110,132 80,118 Z" />
            </Region>

            <Region regionKey="biceps" intensidades={intensidades} onHover={onHover}>
                <rect x="47" y="112" width="18" height="42" rx="9" />
                <rect x="155" y="112" width="18" height="42" rx="9" />
            </Region>

            <Region regionKey="antebrazos" intensidades={intensidades} onHover={onHover}>
                <rect x="43" y="170" width="16" height="52" rx="7" />
                <rect x="161" y="170" width="16" height="52" rx="7" />
            </Region>

            <Region regionKey="abdomen" intensidades={intensidades} onHover={onHover}>
                <rect x="90" y="124" width="40" height="72" rx="10" />
            </Region>

            <Region regionKey="cuadriceps" intensidades={intensidades} onHover={onHover}>
                <rect x="72" y="200" width="32" height="88" rx="13" />
                <rect x="116" y="200" width="32" height="88" rx="13" />
            </Region>

            <Region regionKey="gemelos" intensidades={intensidades} onHover={onHover}>
                <rect x="74" y="296" width="26" height="62" rx="11" />
                <rect x="120" y="296" width="26" height="62" rx="11" />
            </Region>
        </svg>
    );
}

function CuerpoEspalda({ intensidades, onHover }) {
    return (
        <svg viewBox="0 0 220 420" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <g fill="var(--fondo)" stroke="var(--borde)" strokeWidth="1.2">
                <circle cx="110" cy="32" r="22" />
                <rect x="100" y="50" width="20" height="16" rx="6" />
                <path d="M70,66 Q110,50 150,66 L158,120 Q110,140 62,120 Z" />
                <rect x="46" y="108" width="20" height="66" rx="10" />
                <rect x="154" y="108" width="20" height="66" rx="10" />
                <rect x="42" y="168" width="18" height="58" rx="8" />
                <rect x="160" y="168" width="18" height="58" rx="8" />
                <rect x="88" y="120" width="44" height="80" rx="14" />
                <rect x="70" y="196" width="34" height="98" rx="14" />
                <rect x="116" y="196" width="34" height="98" rx="14" />
                <rect x="72" y="292" width="30" height="70" rx="12" />
                <rect x="118" y="292" width="30" height="70" rx="12" />
            </g>

            <Region regionKey="trapecio" intensidades={intensidades} onHover={onHover}>
                <path d="M86,64 Q110,54 134,64 L128,92 Q110,98 92,92 Z" />
            </Region>

            <Region regionKey="hombros" intensidades={intensidades} onHover={onHover}>
                <ellipse cx="60" cy="78" rx="16" ry="14" />
                <ellipse cx="160" cy="78" rx="16" ry="14" />
            </Region>

            <Region regionKey="espalda" intensidades={intensidades} onHover={onHover}>
                <path d="M78,86 Q110,96 142,86 L146,146 Q110,158 74,146 Z" />
            </Region>

            <Region regionKey="triceps" intensidades={intensidades} onHover={onHover}>
                <rect x="47" y="112" width="18" height="42" rx="9" />
                <rect x="155" y="112" width="18" height="42" rx="9" />
            </Region>

            <Region regionKey="lumbares" intensidades={intensidades} onHover={onHover}>
                <rect x="90" y="150" width="40" height="34" rx="9" />
            </Region>

            <Region regionKey="gluteos" intensidades={intensidades} onHover={onHover}>
                <ellipse cx="90" cy="206" rx="19" ry="17" />
                <ellipse cx="130" cy="206" rx="19" ry="17" />
            </Region>

            <Region regionKey="isquiotibiales" intensidades={intensidades} onHover={onHover}>
                <rect x="72" y="228" width="32" height="62" rx="13" />
                <rect x="116" y="228" width="32" height="62" rx="13" />
            </Region>

            <Region regionKey="gemelos" intensidades={intensidades} onHover={onHover}>
                <rect x="74" y="296" width="26" height="62" rx="11" />
                <rect x="120" y="296" width="26" height="62" rx="11" />
            </Region>
        </svg>
    );
}

export default function CuerpoMuscular({ intensidades = {}, vistaInicial = 'front', size = 320 }) {
    const [vista, setVista] = useState(vistaInicial);
    const [hover, setHover] = useState(null);

    const regiones = vista === 'front' ? REGIONES_FRONT : REGIONES_BACK;
    const usadas = [...new Set(regiones)].filter(r => (intensidades[r] ?? 0) > 0.02);

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
                    ? <CuerpoFrente intensidades={intensidades} onHover={setHover} />
                    : <CuerpoEspalda intensidades={intensidades} onHover={setHover} />}
            </div>

            {usadas.length > 0 && (
                <div className="cuerpo-muscular-legend">
                    {usadas
                        .sort((a, b) => (intensidades[b] || 0) - (intensidades[a] || 0))
                        .map(r => (
                            <span key={r} className="cuerpo-muscular-chip">
                                <span
                                    className="cuerpo-muscular-dot"
                                    style={{ background: fillFor(intensidades[r]) }}
                                />
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
