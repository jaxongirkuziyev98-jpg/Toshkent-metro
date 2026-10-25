import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { METRO_LINES, METRO_STATIONS } from '../data/metroData';
import { calculateNextTrainTimes } from '../utils/navigation';
import { LineId, MetroStation } from '../types/metro';
import {
  Search,
  Wifi,
  CreditCard,
  Building,
  Navigation,
  Clock,
  MapPin,
  Bus,
  Accessibility,
  Bike,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface StationDetailViewProps {
  initialStationId?: string;
  onSetRoute: (fromId: string, toId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const StationDetailView: React.FC<StationDetailViewProps> = ({
  initialStationId = 'amir_temur_xiyoboni',
  onSetRoute,
  onNavigateTab,
}) => {
  const { t, language } = useLanguage();
  const [selectedStationId, setSelectedStationId] = useState<string>(initialStationId);
  const [searchQuery, setSearchQuery] = useState('');
  const [lineFilter, setLineFilter] = useState<LineId | 'all'>('all');
  const [tick, setTick] = useState(0);

  // Keep synced if prop changes
  useEffect(() => {
    if (initialStationId && METRO_STATIONS[initialStationId]) {
      setSelectedStationId(initialStationId);
    }
  }, [initialStationId]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const station = METRO_STATIONS[selectedStationId] || METRO_STATIONS['amir_temur_xiyoboni'];
  const line = METRO_LINES[station.lineId];
  const nextTimes = calculateNextTrainTimes(station.id);

  // Filter stations list for directory
  const filteredStations = Object.values(METRO_STATIONS).filter(st => {
    const matchesLine = lineFilter === 'all' || st.lineId === lineFilter;
    const matchesQuery = st.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.name.uz.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLine && matchesQuery;
  });

  const getFacilityIcon = (id: string) => {
    switch (id) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'elevator':
        return <Accessibility className="w-4 h-4" />;
      case 'atm':
      case 'ticketMachine':
        return <CreditCard className="w-4 h-4" />;
      case 'bikeParking':
        return <Bike className="w-4 h-4" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-8">
      {/* Search and Line Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchStation}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Line Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setLineFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              lineFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.allLines}
          </button>
          {Object.values(METRO_LINES).map(l => (
            <button
              key={l.id}
              onClick={() => setLineFilter(l.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                lineFilter === l.id
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span>{l.name[language]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Directory on left / Detailed station card on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Station Quick Selector List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 max-h-[750px] flex flex-col">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-2 px-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bekatlar ro'yxati
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {filteredStations.length} ta
            </span>
          </div>

          <div className="overflow-y-auto space-y-1 pr-1 flex-1">
            {filteredStations.map(st => {
              const stLine = METRO_LINES[st.lineId];
              const isSelected = st.id === selectedStationId;

              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStationId(st.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 border border-blue-200/80 dark:border-blue-800/80'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stLine.color }}
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {st.name[language]}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {stLine.name[language]}
                      </p>
                    </div>
                  </div>

                  {st.interchanges && st.interchanges.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 font-medium ml-2">
                      O'tish
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Station Details Card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Station Banner Card with Real Photo */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
            <div className="h-56 sm:h-64 relative">
              <img
                src={station.imageUrl || '/src/assets/images/tashkent_station_interior_1792944047000.jpg'}
                alt={station.name[language]}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Station Badge and Name on Banner */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {line.name[language]} · Bekat #{station.order}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {station.name[language]}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSetRoute(station.id, '');
                      onNavigateTab('route');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t.setAsStart}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description & History bar */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {station.description[language]}
              </p>
            </div>
          </div>

          {/* Dual Real-time Departures Board */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Keyingi poyezdlar jadvali (Jonli hisoblagich)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Oraliq: {line.intervals.peakMinutes}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Direction 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  1-yo'nalish:
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {nextTimes.dir1.dest}
                </h4>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {String(nextTimes.dir1.minutes).padStart(2, '0')}:{String(nextTimes.dir1.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.minutes}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Birinchi poyezd: {station.firstTrain} · Oxirgi poyezd: {station.lastTrain}
                </p>
              </div>

              {/* Direction 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  2-yo'nalish:
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {nextTimes.dir2.dest}
                </h4>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {String(nextTimes.dir2.minutes).padStart(2, '0')}:{String(nextTimes.dir2.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.minutes}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Birinchi poyezd: {station.firstTrain} · Oxirgi poyezd: {station.lastTrain}
                </p>
              </div>
            </div>
          </div>

          {/* Exits and Nearby Attractions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.exitsAndStreets}
              </h3>
            </div>

            <div className="space-y-3">
              {station.exits.map((exit, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {exit.gate}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {exit.street}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                      Yaqin joylar va diqqatga sazovor maskanlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {exit.nearbyPlaces.map((place, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-medium"
                        >
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>

                  {exit.connectingBuses && exit.connectingBuses.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                      <Bus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Ulanuvchi avtobus yo'nalishlari:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {exit.connectingBuses.map((busNum, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                          >
                            № {busNum}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Station Amenities / Facilities */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              {t.facilities}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {station.facilities.map(facility => (
                <div
                  key={facility.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                    facility.available
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      facility.available
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {getFacilityIcon(facility.id)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block leading-tight">
                      {facility.name[language]}
                    </span>
                    <span className="text-[10px]">
                      {facility.available ? 'Mavjud' : 'Hozircha yo\'q'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
