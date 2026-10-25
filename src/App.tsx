import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './components/HomeView';
import { MetroMapView } from './components/MetroMapView';
import { StationDetailView } from './components/StationDetailView';
import { RouteFinderView } from './components/RouteFinderView';
import { ScheduleNewsView } from './components/ScheduleNewsView';
import { AboutContactView } from './components/AboutContactView';
import { TrainReminderModal } from './components/TrainReminderModal';
import { FavoriteRoute } from './types/metro';
import { METRO_STATIONS } from './data/metroData';
import { findNearestStation } from './utils/navigation';

const DEFAULT_FAVORITES: FavoriteRoute[] = [
  {
    id: 'fav_home_work',
    name: 'Uy — Ish',
    fromId: 'chilonzor',
    toId: 'amir_temur_xiyoboni',
  },
  {
    id: 'fav_home_uni',
    name: 'Uy — Universitet',
    fromId: 'yunusobod',
    toId: 'beruniy',
  },
  {
    id: 'fav_bazaar',
    name: 'Uy — Chorsu bozori',
    fromId: 'buyuk_ipak_yoli',
    toId: 'chorsu',
  },
];

function MetroApp() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStationId, setSelectedStationId] = useState<string>('amir_temur_xiyoboni');
  const [routeFromId, setRouteFromId] = useState<string>('amir_temur_xiyoboni');
  const [routeToId, setRouteToId] = useState<string>('chorsu');
  const [highlightRouteStations, setHighlightRouteStations] = useState<string[]>([]);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderStationId, setReminderStationId] = useState<string>('amir_temur_xiyoboni');

  // Favorites in localStorage
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>(() => {
    try {
      const saved = localStorage.getItem('tashkent_metro_favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_FAVORITES;
  });

  const handleSaveFavorite = (fromId: string, toId: string) => {
    const fromSt = METRO_STATIONS[fromId];
    const toSt = METRO_STATIONS[toId];
    if (!fromSt || !toSt) return;

    const newFav: FavoriteRoute = {
      id: `fav_${Date.now()}`,
      name: `${fromSt.name.uz} — ${toSt.name.uz}`,
      fromId,
      toId,
    };

    const updated = [newFav, ...favoriteRoutes.filter(f => !(f.fromId === fromId && f.toId === toId))].slice(0, 8);
    setFavoriteRoutes(updated);
    localStorage.setItem('tashkent_metro_favorites', JSON.stringify(updated));
  };

  const handleSelectFavoriteRoute = (fromId: string, toId: string) => {
    setRouteFromId(fromId);
    setRouteToId(toId);
    setActiveTab('route');
  };

  const handleSetRoute = (fromId: string, toId: string) => {
    if (fromId) setRouteFromId(fromId);
    if (toId) setRouteToId(toId);
  };

  const handleSelectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setActiveTab('stations');
  };

  const handleViewOnMap = (routeStationIds: string[]) => {
    setHighlightRouteStations(routeStationIds);
    setActiveTab('map');
  };

  const handleOpenReminder = (stationId?: string) => {
    if (stationId) setReminderStationId(stationId);
    setIsReminderOpen(true);
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const res = findNearestStation(pos.coords.latitude, pos.coords.longitude);
          setSelectedStationId(res.station.id);
          setActiveTab('stations');
        },
        () => {
          // Default to center
          setSelectedStationId('amir_temur_xiyoboni');
          setActiveTab('stations');
        }
      );
    } else {
      setSelectedStationId('amir_temur_xiyoboni');
      setActiveTab('stations');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'map') setHighlightRouteStations([]);
        }}
        onOpenReminderModal={() => handleOpenReminder(selectedStationId)}
        onDetectGPS={handleDetectGPS}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeView
            onNavigateTab={tab => {
              setActiveTab(tab);
              if (tab !== 'map') setHighlightRouteStations([]);
            }}
            onSelectStation={handleSelectStation}
            onSetRoute={(f, t) => {
              handleSetRoute(f, t);
              setActiveTab('route');
            }}
            onOpenReminderModal={() => handleOpenReminder(selectedStationId)}
            favoriteRoutes={favoriteRoutes}
            onSelectFavoriteRoute={handleSelectFavoriteRoute}
          />
        )}

        {activeTab === 'map' && (
          <MetroMapView
            onSelectStation={handleSelectStation}
            onSetRoute={(f, t) => {
              handleSetRoute(f, t);
              setActiveTab('route');
            }}
            highlightStationId={selectedStationId}
            highlightRouteStations={highlightRouteStations}
          />
        )}

        {activeTab === 'stations' && (
          <StationDetailView
            initialStationId={selectedStationId}
            onSetRoute={(f, t) => {
              handleSetRoute(f, t);
              setActiveTab('route');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'route' && (
          <RouteFinderView
            initialFromId={routeFromId}
            initialToId={routeToId}
            onViewOnMap={handleViewOnMap}
            onSaveFavorite={handleSaveFavorite}
            onOpenReminderModal={handleOpenReminder}
          />
        )}

        {activeTab === 'schedule' && <ScheduleNewsView />}

        {activeTab === 'about' && <AboutContactView />}
      </main>

      {/* Footer (quiet, clean, compliant with anti-slop) */}
      <footer className="hidden lg:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Toshkent Metro Yo'lboshchi</span>
            <span>·</span>
            <span>Toshkent shahar jamoat transporti ma'lumotlar tizimi</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('map')} className="hover:underline">
              {t.map}
            </button>
            <button onClick={() => setActiveTab('schedule')} className="hover:underline">
              {t.schedule}
            </button>
            <button onClick={() => setActiveTab('about')} className="hover:underline">
              {t.about}
            </button>
            <span>Ishonch telefoni: 71 232 50 18</span>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'map') setHighlightRouteStations([]);
        }}
      />

      {/* Train Arrival Notification Modal */}
      <TrainReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        defaultStationId={reminderStationId}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MetroApp />
    </LanguageProvider>
  );
}
