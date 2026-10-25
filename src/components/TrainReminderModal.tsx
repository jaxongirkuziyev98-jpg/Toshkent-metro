import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { METRO_STATIONS, METRO_LINES } from '../data/metroData';
import { calculateNextTrainTimes } from '../utils/navigation';
import { Bell, Check, Clock, X, Volume2 } from 'lucide-react';

interface TrainReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStationId?: string;
}

export const TrainReminderModal: React.FC<TrainReminderModalProps> = ({
  isOpen,
  onClose,
  defaultStationId = 'amir_temur_xiyoboni',
}) => {
  const { t, language } = useLanguage();
  const [selectedStationId, setSelectedStationId] = useState(defaultStationId);
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [isSaved, setIsSaved] = useState(false);
  const [currentTrainTime, setCurrentTrainTime] = useState<{ min: number; sec: number }>({ min: 3, sec: 15 });

  useEffect(() => {
    if (defaultStationId) {
      setSelectedStationId(defaultStationId);
    }
  }, [defaultStationId]);

  useEffect(() => {
    if (!isOpen) return;
    const updateTime = () => {
      const times = calculateNextTrainTimes(selectedStationId);
      setCurrentTrainTime({ min: times.dir1.minutes, sec: times.dir1.seconds });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedStationId]);

  if (!isOpen) return null;

  const currentStation = METRO_STATIONS[selectedStationId] || METRO_STATIONS['amir_temur_xiyoboni'];
  const stationLine = METRO_LINES[currentStation.lineId];

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
  };

  const handleSaveReminder = () => {
    playBeep();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                {t.reminderTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Poyezd yaqinlashganda xabar berish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.selectStation}
            </label>
            <select
              value={selectedStationId}
              onChange={e => setSelectedStationId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(METRO_STATIONS).map(st => (
                <option key={st.id} value={st.id}>
                  {st.name[language]} ({METRO_LINES[st.lineId].name[language]})
                </option>
              ))}
            </select>
          </div>

          {/* Current station arrival status */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: stationLine.color }}
              />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stationLine.name[language]}
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentStation.directions.dir1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                {t.nextTrainIn}
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {String(currentTrainTime.min).padStart(2, '0')}:{String(currentTrainTime.sec).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Timing options */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Qancha vaqt oldin xabar berilsin?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setReminderMinutes(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    reminderMinutes === mins
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{mins} {t.minutes}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {t.reminderDescription}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveReminder}
              disabled={isSaved}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.reminderSetMsg}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{t.setReminder} ({reminderMinutes} {t.minutes})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
