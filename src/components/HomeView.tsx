import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { METRO_LINES, METRO_STATIONS, SERVICE_ALERTS, TASHKENT_METRO_STATS } from '../data/metroData';
import { calculateNextTrainTimes, findNearestStation, getCrowdLevel } from '../utils/navigation';
import { FavoriteRoute, MetroStation } from '../types/metro';
import {
  Search,
  MapPin,
  ArrowRight,
  Clock,
  Compass,
  Map as MapIcon,
  Navigation,
  Sparkles,
  ArrowUpDown,
  Star,
  Users,
  AlertCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';

interface HomeViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectStation: (stationId: string) => void;
  onSetRoute: (fromId: string, toId: string) => void;
  onOpenReminderModal: () => void;
  favoriteRoutes: FavoriteRoute[];
  onSelectFavoriteRoute: (fromId: string, toId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onSelectStation,
  onSetRoute,
  onOpenReminderModal,
  favoriteRoutes,
  onSelectFavoriteRoute,
}) => {
  const { t, language } = useLanguage();

  const [fromStationId, setFromStationId] = useState<string>('amir_temur_xiyoboni');
  const [toStationId, setToStationId] = useState<string>('chorsu');
  const [nearestStationInfo, setNearestStationInfo] = useState<{
    station: MetroStation;
    distanceMeters: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Live seconds tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS Nearest Station Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        const res = findNearestStation(pos.coords.latitude, pos.coords.longitude);
        setNearestStationInfo(res);
      },
      err => {
        setIsLocating(false);
        // Fallback to Tashkent city center coordinates (Amir Temur Square)
        const res = findNearestStation(41.3117, 69.2796);
        setNearestStationInfo({
          ...res,
          distanceMeters: 350,
        });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Initial auto-detect default
  useEffect(() => {
    const defaultNear = findNearestStation(41.3117, 69.2796); // Amir Temur Square
    setNearestStationInfo({
      station: defaultNear.station,
      distanceMeters: 280,
    });
  }, []);

  const handleSwapStations = () => {
    const temp = fromStationId;
    setFromStationId(toStationId);
    setToStationId(temp);
  };

  const handleFindRoute = () => {
    if (fromStationId && toStationId) {
      onSetRoute(fromStationId, toStationId);
      onNavigateTab('route');
    }
  };

  const crowd = getCrowdLevel();
  const nearestStation = nearestStationInfo?.station;
  const nearestNextTimes = nearestStation ? calculateNextTrainTimes(nearestStation.id) : null;
  const nearestLine = nearestStation ? METRO_LINES[nearestStation.lineId] : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-8">
      {/* Hero Section with Search Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/tashkent_metro_hero_1792944047291.jpg"
            alt="Tashkent Metro Train"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Toshkent Metropoliteni rasmiy yo'nalish ma'lumotlari</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance leading-tight">
            Poyezd qachon keladi?
            <span className="block text-blue-400 mt-1">
              Bir zumda bilib oling.
            </span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Keyingi poyezd necha daqiqada kelishi, bekatlarga chiqish yo'llari va eng maqbul metro yo'nalishlari real vaqtda bir joyda.
          </p>

          {/* Search Box: Qayerdan -> Qayerga */}
          <div className="mt-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
              {/* Qayerdan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {t.from}
                </label>
                <select
                  value={fromStationId}
                  onChange={e => setFromStationId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(METRO_STATIONS).map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name[language]} ({METRO_LINES[st.lineId].name[language]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex sm:flex-col justify-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwapStations}
                  title="Bekatlarni almashtirish"
                  className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Qayerga */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {t.to}
                </label>
                <select
                  value={toStationId}
                  onChange={e => setToStationId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(METRO_STATIONS).map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name[language]} ({METRO_LINES[st.lineId].name[language]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleFindRoute}
                  className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t.findRoute}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigateTab('map')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MapIcon className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t.map}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            4 ta liniya va harakatdagi poyezdlar
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('route')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t.route}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Eng qisqa yo'l va o'tish joylari
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('stations')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t.station}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            50 ta bekat va chiqish ko'chalari
          </p>
        </button>

        <button
          onClick={onOpenReminderModal}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t.reminderTitle}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Poyezd kelishidan 5 daqiqa oldin ogohlantirish
          </p>
        </button>
      </div>

      {/* 2-Column Section: Nearest Station Live Widget & Current System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nearest Station Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.nearestStation}
                </h3>
              </div>
              <button
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {isLocating ? 'Aniqlanmoqda...' : t.detectNearest}
              </button>
            </div>

            {nearestStation && nearestLine && nearestNextTimes && (
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: nearestLine.color }}
                      />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {nearestLine.name[language]}
                      </span>
                    </div>
                    <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {nearestStation.name[language]}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Sizdan taxminan {nearestStationInfo?.distanceMeters} {t.metersAway}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectStation(nearestStation.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Bekat tafsilotlari"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Live Departures Dual Board */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                      {nearestStation.directions.dir1} tomon
                    </span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {String(nearestNextTimes.dir1.minutes).padStart(2, '0')}:{String(nearestNextTimes.dir1.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.minutes}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                      Oraliq: {nearestLine.intervals.peakMinutes}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                      {nearestStation.directions.dir2} tomon
                    </span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {String(nearestNextTimes.dir2.minutes).padStart(2, '0')}:{String(nearestNextTimes.dir2.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.minutes}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                      Oraliq: {nearestLine.intervals.peakMinutes}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Bugun ish vaqti: {TASHKENT_METRO_STATS.operatingHours}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">ATTO: 1,700 so'm</span>
          </div>
        </div>

        {/* Current Crowd & Live Alerts Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.crowdLevel}
                </h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${crowd.badgeColor}`}>
                {crowd.label[language]}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              {crowd.tip[language]}
            </p>

            {/* Live Announcements / Alerts */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.alertsAndNews}</span>
              </h4>

              {SERVICE_ALERTS.slice(0, 2).map(alert => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span>{alert.title[language]}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{alert.date}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {alert.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Barcha xabarlar va jadval</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Favorite Routes Section */}
      {favoriteRoutes.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.favoriteRoutes}
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              1 bosishda poyezd vaqti va yo'nalish
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteRoutes.map(fav => {
              const fromSt = METRO_STATIONS[fav.fromId];
              const toSt = METRO_STATIONS[fav.toId];
              if (!fromSt || !toSt) return null;
              const liveTimes = calculateNextTrainTimes(fromSt.id);

              return (
                <div
                  key={fav.id}
                  onClick={() => onSelectFavoriteRoute(fav.fromId, fav.toId)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {fav.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {liveTimes.dir1.minutes} daq
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="truncate">{fromSt.name[language]}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    <span className="truncate">{toSt.name[language]}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Keyingi poyezd: {liveTimes.dir1.dest} tomon
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
