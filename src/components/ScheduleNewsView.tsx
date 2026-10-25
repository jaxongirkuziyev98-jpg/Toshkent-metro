import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { METRO_LINES, SERVICE_ALERTS, TASHKENT_METRO_STATS } from '../data/metroData';
import { LineId } from '../types/metro';
import { Clock, Calendar, AlertTriangle, CheckCircle, Info, ChevronRight, Newspaper } from 'lucide-react';

export const ScheduleNewsView: React.FC = () => {
  const { t, language } = useLanguage();
  const [dayType, setDayType] = useState<'weekday' | 'weekend'>('weekday');
  const [activeAlertFilter, setActiveAlertFilter] = useState<'all' | 'normal' | 'info' | 'warning'>('all');

  const filteredAlerts = SERVICE_ALERTS.filter(alert => {
    if (activeAlertFilter === 'all') return true;
    return alert.severity === activeAlertFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.schedule}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Harakat jadvallari, oraliq vaqtlar va poytaxt metropoliteni rasmiy xabarlari.
        </p>
      </div>

      {/* Weekdays / Weekends Segmented Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Poyezdlar harakatlanish oraliq vaqti
            </h3>
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setDayType('weekday')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dayType === 'weekday'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ish kunlari (Dush - Juma)
            </button>
            <button
              onClick={() => setDayType('weekend')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dayType === 'weekend'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dam olish kunlari (Shan - Yak)
            </button>
          </div>
        </div>

        {/* Lines Interval Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(METRO_LINES).map(line => {
            const peak = dayType === 'weekday' ? line.intervals.peakMinutes : '5 - 6 daqiqa';
            const day = dayType === 'weekday' ? line.intervals.dayMinutes : '7 - 8 daqiqa';
            const night = dayType === 'weekday' ? line.intervals.nightMinutes : '10 - 12 daqiqa';

            return (
              <div
                key={line.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: line.color }} />
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {line.name[language]}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {line.endpoints.from} — {line.endpoints.to}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Tig'iz vaqt
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                        {peak}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Kunduzgi
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                        {day}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Kechki
                      </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                        {night}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Birinchi poyezd: 05:00</span>
                  <span>Oxirgi poyezd: 00:00</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Alerts & Announcements Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Newspaper className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.alertsAndNews}
            </h3>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveAlertFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeAlertFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setActiveAlertFilter('normal')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeAlertFilter === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Me'yorda
            </button>
            <button
              onClick={() => setActiveAlertFilter('info')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeAlertFilter === 'info'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Rejali ishlar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {alert.title[language]}
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {alert.date}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {alert.description[language]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
