import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { METRO_LINES, METRO_STATIONS } from '../data/metroData';
import { calculateNextTrainTimes } from '../utils/navigation';
import { MetroStation, LineId } from '../types/metro';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Clock,
  ArrowRight,
  Maximize2,
  X,
  Compass,
} from 'lucide-react';

interface MetroMapViewProps {
  onSelectStation: (stationId: string) => void;
  onSetRoute: (fromId: string, toId: string) => void;
  highlightStationId?: string;
  highlightRouteStations?: string[];
}

export const MetroMapView: React.FC<MetroMapViewProps> = ({
  onSelectStation,
  onSetRoute,
  highlightStationId,
  highlightRouteStations = [],
}) => {
  const { t, language } = useLanguage();
  const [selectedStation, setSelectedStation] = useState<MetroStation | null>(() => {
    return highlightStationId ? METRO_STATIONS[highlightStationId] || null : null;
  });
  const [selectedLineFilter, setSelectedLineFilter] = useState<LineId | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0);

  // Train animation progress states (0 to 1 along each line)
  const [trainProgress, setTrainProgress] = useState({
    chilonzor1: 0.15,
    chilonzor2: 0.65,
    ozbekiston1: 0.35,
    ozbekiston2: 0.85,
    yunusobod1: 0.45,
    halqa1: 0.2,
    halqa2: 0.7,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // Update selected station if prop changes
  useEffect(() => {
    if (highlightStationId && METRO_STATIONS[highlightStationId]) {
      setSelectedStation(METRO_STATIONS[highlightStationId]);
    }
  }, [highlightStationId]);

  // Live timer tick & train position animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
      setTrainProgress(prev => ({
        chilonzor1: (prev.chilonzor1 + 0.003) % 1,
        chilonzor2: (prev.chilonzor2 + 0.003) % 1,
        ozbekiston1: (prev.ozbekiston1 + 0.0035) % 1,
        ozbekiston2: (prev.ozbekiston2 + 0.0035) % 1,
        yunusobod1: (prev.yunusobod1 + 0.004) % 1,
        halqa1: (prev.halqa1 + 0.0025) % 1,
        halqa2: (prev.halqa2 + 0.0025) % 1,
      }));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.6), 2.4));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // only pan if not clicking a button
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to interpolate train point on a polyline given station coordinates
  const getPointAlongStationPath = (stationIds: string[], progress: number) => {
    if (stationIds.length < 2) return { x: 500, y: 500 };
    const totalSegments = stationIds.length - 1;
    const scaledProg = progress * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProg), totalSegments - 1);
    const subProgress = scaledProg - segmentIndex;

    const st1 = METRO_STATIONS[stationIds[segmentIndex]];
    const st2 = METRO_STATIONS[stationIds[segmentIndex + 1]];
    if (!st1 || !st2) return { x: 500, y: 500 };

    return {
      x: st1.mapCoords.x + (st2.mapCoords.x - st1.mapCoords.x) * subProgress,
      y: st1.mapCoords.y + (st2.mapCoords.y - st1.mapCoords.y) * subProgress,
    };
  };

  // Build SVG path string for each line
  const makeLinePath = (lineId: LineId) => {
    const line = METRO_LINES[lineId];
    if (!line || line.stations.length === 0) return '';
    const points = line.stations
      .map(id => METRO_STATIONS[id])
      .filter(Boolean)
      .map(st => `${st.mapCoords.x},${st.mapCoords.y}`);
    return `M ${points.join(' L ')}`;
  };

  const isStationHighlighted = (stationId: string) => {
    if (highlightRouteStations.length > 0) {
      return highlightRouteStations.includes(stationId);
    }
    return selectedStation?.id === stationId;
  };

  const nextTimes = selectedStation ? calculateNextTrainTimes(selectedStation.id) : null;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] max-h-[920px] bg-slate-900 overflow-hidden flex flex-col select-none">
      {/* Top Map Toolbar: Filter by line & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Line filter segmented buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedLineFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedLineFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.allLines}
          </button>
          {Object.values(METRO_LINES).map(line => (
            <button
              key={line.id}
              onClick={() => setSelectedLineFilter(line.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedLineFilter === line.id
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span>{line.name[language]}</span>
            </button>
          ))}
        </div>

        {/* Zoom & View Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-1 shadow-lg">
          <button
            onClick={() => handleZoom(0.2)}
            title={t.zoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            title={t.zoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title={t.resetView}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas with Interactive Pan & Zoom */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1200 960"
          className="w-full h-full transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          }}
        >
          {/* Subtle Grid / Background styling */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            {/* Glow Filter for Active Trains */}
            <filter id="trainGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="#0f172a" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* City Canal / River decorative geographic landmark */}
          <path
            d="M 620,0 C 640,240 600,450 640,650 C 660,780 630,960 620,960"
            fill="none"
            stroke="rgba(56, 189, 248, 0.12)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <text x="640" y="50" fill="rgba(56, 189, 248, 0.3)" fontSize="10" fontStyle="italic">
            Anhor kanali
          </text>

          {/* INTERCHANGE CONNECTORS (Lines connecting Paxtakor-Navoiy, Amir Temur-Rajabiy, etc.) */}
          <g id="interchange-links">
            {/* Paxtakor <-> Alisher Navoiy */}
            <line
              x1="490" y1="390"
              x2="490" y2="390"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Amir Temur <-> Yunus Rajabiy */}
            <line
              x1="650" y1="340"
              x2="650" y2="340"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Oybek <-> Ming O'rik */}
            <line
              x1="690" y1="560"
              x2="650" y2="560"
              stroke="#cbd5e1"
              strokeWidth="5"
              strokeDasharray="3 3"
            />
            {/* Do'stlik <-> Do'stlik-2 */}
            <line
              x1="910" y1="620"
              x2="910" y2="620"
              stroke="#cbd5e1"
              strokeWidth="5"
            />
            {/* Chinor <-> Qipchoq */}
            <line
              x1="460" y1="890"
              x2="460" y2="890"
              stroke="#cbd5e1"
              strokeWidth="5"
            />
          </g>

          {/* METRO LINES TRACKS */}
          <g id="metro-tracks">
            {Object.values(METRO_LINES).map(line => {
              const isDimmed = selectedLineFilter !== 'all' && selectedLineFilter !== line.id;
              return (
                <g key={line.id} opacity={isDimmed ? 0.2 : 1} className="transition-opacity duration-300">
                  {/* Outer casing */}
                  <path
                    d={makeLinePath(line.id)}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Colored track */}
                  <path
                    d={makeLinePath(line.id)}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </g>

          {/* HIGHLIGHTED ACTIVE ROUTE OVERLAY */}
          {highlightRouteStations.length > 1 && (
            <g id="highlighted-route">
              <polyline
                points={highlightRouteStations
                  .map(id => METRO_STATIONS[id])
                  .filter(Boolean)
                  .map(st => `${st.mapCoords.x},${st.mapCoords.y}`)
                  .join(' ')}
                fill="none"
                stroke="#ffffff"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
                className="animate-pulse"
              />
            </g>
          )}

          {/* REAL-TIME MOVING TRAINS */}
          <g id="live-trains">
            {/* Chilonzor Train 1 */}
            {(() => {
              const pt = getPointAlongStationPath(METRO_LINES.chilonzor.stations, trainProgress.chilonzor1);
              return (
                <g transform={`translate(${pt.x}, ${pt.y})`} filter="url(#trainGlow)">
                  <circle r="7" fill="#ffffff" stroke="#EF4444" strokeWidth="2.5" />
                  <circle r="3" fill="#EF4444" />
                </g>
              );
            })()}
            {/* Chilonzor Train 2 */}
            {(() => {
              const pt = getPointAlongStationPath(METRO_LINES.chilonzor.stations, trainProgress.chilonzor2);
              return (
                <g transform={`translate(${pt.x}, ${pt.y})`} filter="url(#trainGlow)">
                  <circle r="7" fill="#ffffff" stroke="#EF4444" strokeWidth="2.5" />
                  <circle r="3" fill="#EF4444" />
                </g>
              );
            })()}
            {/* O'zbekiston Train 1 */}
            {(() => {
              const pt = getPointAlongStationPath(METRO_LINES.ozbekiston.stations, trainProgress.ozbekiston1);
              return (
                <g transform={`translate(${pt.x}, ${pt.y})`} filter="url(#trainGlow)">
                  <circle r="7" fill="#ffffff" stroke="#3B82F6" strokeWidth="2.5" />
                  <circle r="3" fill="#3B82F6" />
                </g>
              );
            })()}
            {/* Yunusobod Train 1 */}
            {(() => {
              const pt = getPointAlongStationPath(METRO_LINES.yunusobod.stations, trainProgress.yunusobod1);
              return (
                <g transform={`translate(${pt.x}, ${pt.y})`} filter="url(#trainGlow)">
                  <circle r="7" fill="#ffffff" stroke="#10B981" strokeWidth="2.5" />
                  <circle r="3" fill="#10B981" />
                </g>
              );
            })()}
            {/* Halqa Train 1 */}
            {(() => {
              const pt = getPointAlongStationPath(METRO_LINES.halqa.stations, trainProgress.halqa1);
              return (
                <g transform={`translate(${pt.x}, ${pt.y})`} filter="url(#trainGlow)">
                  <circle r="7" fill="#ffffff" stroke="#F59E0B" strokeWidth="2.5" />
                  <circle r="3" fill="#F59E0B" />
                </g>
              );
            })()}
          </g>

          {/* STATIONS NODES & LABELS */}
          <g id="stations">
            {Object.values(METRO_STATIONS).map(st => {
              const isSelected = selectedStation?.id === st.id;
              const isHighlight = isStationHighlighted(st.id);
              const isInterchange = (st.interchanges && st.interchanges.length > 0);
              const isDimmed = selectedLineFilter !== 'all' && selectedLineFilter !== st.lineId;

              return (
                <g
                  key={st.id}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedStation(st);
                  }}
                  className="cursor-pointer group"
                  opacity={isDimmed ? 0.2 : 1}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={st.mapCoords.x}
                      cy={st.mapCoords.y}
                      r="16"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      className="animate-ping"
                      opacity="0.8"
                    />
                  )}

                  {/* Station Node Outer */}
                  <circle
                    cx={st.mapCoords.x}
                    cy={st.mapCoords.y}
                    r={isInterchange ? 8 : 5}
                    fill={isInterchange ? '#ffffff' : '#0f172a'}
                    stroke={isSelected || isHighlight ? '#38bdf8' : METRO_LINES[st.lineId].color}
                    strokeWidth={isInterchange ? 3 : 2.5}
                    className="transition-all duration-150 group-hover:scale-125"
                  />

                  {/* Interchange inner dot */}
                  {isInterchange && (
                    <circle
                      cx={st.mapCoords.x}
                      cy={st.mapCoords.y}
                      r="3.5"
                      fill={METRO_LINES[st.lineId].color}
                    />
                  )}

                  {/* Station Text Label */}
                  <text
                    x={st.mapCoords.x + 10}
                    y={st.mapCoords.y + 4}
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize={isSelected ? '12' : isInterchange ? '11' : '10'}
                    fontWeight={isSelected || isInterchange ? '700' : '500'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {st.name[language]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Station Interactive Bottom Sheet / Drawer */}
      {selectedStation && nextTimes && (
        <div className="absolute bottom-4 left-4 right-4 max-w-lg mx-auto z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-white animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: METRO_LINES[selectedStation.lineId].color }}
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedStation.name[language]}
                </h3>
                <p className="text-xs text-slate-400">
                  {METRO_LINES[selectedStation.lineId].name[language]} · {selectedStation.firstTrain} - {selectedStation.lastTrain}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStation(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live arrival cards for both directions */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block truncate">
                {selectedStation.directions.dir1}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                  {nextTimes.dir1.minutes}:{String(nextTimes.dir1.seconds).padStart(2, '0')}
                </span>
                <span className="text-[11px] text-slate-400">{t.minutes}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block truncate">
                {selectedStation.directions.dir2}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                  {nextTimes.dir2.minutes}:{String(nextTimes.dir2.seconds).padStart(2, '0')}
                </span>
                <span className="text-[11px] text-slate-400">{t.minutes}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                onSetRoute(selectedStation.id, '');
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.setAsStart}</span>
            </button>
            <button
              onClick={() => onSelectStation(selectedStation.id)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.station} tafsiloti</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
