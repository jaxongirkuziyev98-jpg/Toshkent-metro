import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { METRO_LINES, METRO_STATIONS, TASHKENT_METRO_STATS } from '../data/metroData';
import { findBestRoute } from '../utils/navigation';
import { FavoriteRoute, RouteResult } from '../types/metro';
import {
  Navigation,
  ArrowUpDown,
  Clock,
  Coins,
  MapPin,
  ArrowRight,
  Star,
  Check,
  Share2,
  Bell,
  Map,
  Repeat,
} from 'lucide-react';

interface RouteFinderViewProps {
  initialFromId?: string;
  initialToId?: string;
  onViewOnMap: (routeStationIds: string[]) => void;
  onSaveFavorite: (fromId: string, toId: string) => void;
  onOpenReminderModal: (stationId: string) => void;
}

export const RouteFinderView: React.FC<RouteFinderViewProps> = ({
  initialFromId = 'amir_temur_xiyoboni',
  initialToId = 'chorsu',
  onViewOnMap,
  onSaveFavorite,
  onOpenReminderModal,
}) => {
  const { t, language } = useLanguage();
  const [fromStationId, setFromStationId] = useState<string>(initialFromId);
  const [toStationId, setToStationId] = useState<string>(initialToId);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Sync if props change
  useEffect(() => {
    if (initialFromId) setFromStationId(initialFromId);
    if (initialToId) setToStationId(initialToId);
  }, [initialFromId, initialToId]);

  // Recalculate route whenever start or end station changes
  useEffect(() => {
    if (fromStationId && toStationId) {
      const res = findBestRoute(fromStationId, toStationId);
      setRouteResult(res);
      setIsSaved(false);
    }
  }, [fromStationId, toStationId]);

  const handleSwap = () => {
    const temp = fromStationId;
    setFromStationId(toStationId);
    setToStationId(temp);
  };

  const handleSaveFavorite = () => {
    onSaveFavorite(fromStationId, toStationId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleViewOnMap = () => {
    if (!routeResult) return;
    const allPassedStations: string[] = [];
    routeResult.steps.forEach(step => {
      step.stationsPassed.forEach(stId => {
        if (!allPassedStations.includes(stId)) {
          allPassedStations.push(stId);
        }
      });
    });
    onViewOnMap(allPassedStations);
  };

  const fromStation = METRO_STATIONS[fromStationId];
  const toStation = METRO_STATIONS[toStationId];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-8">
      {/* Search Header Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-2xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.route}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Qayerdan va qayerga borishni tanlang. Eng tezyurar marshrut va bekatlar ketma-ketligi hisoblanadi.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t.from}
            </label>
            <select
              value={fromStationId}
              onChange={e => setFromStationId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(METRO_STATIONS).map(st => (
                <option key={st.id} value={st.id}>
                  {st.name[language]} ({METRO_LINES[st.lineId].name[language]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex sm:flex-col justify-center pt-2 sm:pt-6">
            <button
              onClick={handleSwap}
              title="Almashtirish"
              className="p-2.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t.to}
            </label>
            <select
              value={toStationId}
              onChange={e => setToStationId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(METRO_STATIONS).map(st => (
                <option key={st.id} value={st.id}>
                  {st.name[language]} ({METRO_LINES[st.lineId].name[language]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Route Result Display */}
      {routeResult && (
        <div className="space-y-6">
          {/* Summary Strip (Time, Stations, Transfers, Fare) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{t.totalTime}</span>
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  ~{routeResult.totalDurationMinutes}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{t.minutes}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{t.stationsCount}</span>
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  {routeResult.totalStations}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{t.stops}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-purple-500" />
                <span>{t.transfers}</span>
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  {routeResult.transferCount}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {routeResult.transferCount === 0 ? 'To\'g\'ri' : 'o\'tish'}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Yo'l haqi (ATTO)</span>
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                  {routeResult.fareUzs.atto.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{t.uzs}</span>
              </div>
            </div>
          </div>

          {/* Action buttons (Map view, Save favorite, Reminder) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleViewOnMap}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Map className="w-4 h-4" />
              <span>Xaritada yo'nalishni ko'rish</span>
            </button>

            <button
              onClick={handleSaveFavorite}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                isSaved
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4 text-amber-500" />}
              <span>{isSaved ? t.routeSaved : t.saveRoute}</span>
            </button>

            <button
              onClick={() => onOpenReminderModal(fromStationId)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Bell className="w-4 h-4 text-purple-500" />
              <span>{t.reminderTitle}</span>
            </button>
          </div>

          {/* Step-by-Step Route Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Bosqichma-bosqich harakatlanish
            </h3>

            <div className="space-y-6">
              {routeResult.steps.map((step, idx) => {
                const stepLine = METRO_LINES[step.lineId];
                const fromSt = METRO_STATIONS[step.fromStationId];
                const toSt = METRO_STATIONS[step.toStationId];

                if (step.type === 'transfer') {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                          Liniya almashtirish (Piyoda o'tish)
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                          {step.instruction[language]}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                          O'tish vaqti: ~{step.durationMinutes} daqiqa
                        </span>
                      </div>
                    </div>
                  );
                }

                // Travel leg
                return (
                  <div key={idx} className="relative pl-8">
                    {/* Visual Line Bar on the left */}
                    <div
                      className="absolute left-2.5 top-3 bottom-3 w-1.5 rounded-full"
                      style={{ backgroundColor: stepLine.color }}
                    />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 shrink-0"
                          style={{ backgroundColor: stepLine.color }}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: stepLine.color }}>
                          {stepLine.name[language]}
                        </span>
                        <span className="text-xs text-slate-400">· ~{step.durationMinutes} {t.minutes}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {step.instruction[language]}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                            O'tiladigan bekatlar ketma-ketligi:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {step.stationsPassed.map((stId, sIdx) => {
                              const s = METRO_STATIONS[stId];
                              const isLast = sIdx === step.stationsPassed.length - 1;
                              return (
                                <React.Fragment key={stId}>
                                  <span
                                    className={`px-2 py-0.5 rounded-lg font-medium ${
                                      sIdx === 0 || isLast
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                    }`}
                                  >
                                    {s.name[language]}
                                  </span>
                                  {!isLast && <ArrowRight className="w-3 h-3 text-slate-400" />}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Destination Arrival Note */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-semibold">
                Siz ko'zlangan manzil — "{toStation.name[language]}" bekatiga yetib kelasiz!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
