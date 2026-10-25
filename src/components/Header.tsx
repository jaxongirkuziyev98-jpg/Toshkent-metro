import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types/metro';
import { Sun, Moon, MapPin, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReminderModal: () => void;
  onDetectGPS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReminderModal,
  onDetectGPS,
}) => {
  const { language, setLanguage, t, isDark, toggleTheme } = useLanguage();

  const navLinks = [
    { id: 'home', label: t.home },
    { id: 'map', label: t.map },
    { id: 'stations', label: t.station },
    { id: 'route', label: t.route },
    { id: 'schedule', label: t.schedule },
    { id: 'about', label: t.about },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left text-slate-900 dark:text-white whitespace-nowrap shrink-0 group focus-visible:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm group-hover:bg-blue-700 transition-colors">
            M
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block leading-tight">
              Toshkent Metro
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5 font-medium">
              Yo'lboshchi · Guide
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, clean hover underline) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 relative ${
                activeTab === link.id
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {link.label}
              {activeTab === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick GPS button */}
          <button
            onClick={onDetectGPS}
            title={t.detectNearest}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.nearestStation}</span>
          </button>

          {/* Quick Reminder button */}
          <button
            onClick={onOpenReminderModal}
            title={t.reminderTitle}
            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
            {(['uz', 'ru', 'en'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded transition-colors uppercase ${
                  language === lang
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
