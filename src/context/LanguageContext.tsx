import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types/metro';

interface Translations {
  appName: string;
  appSubtitle: string;
  home: string;
  map: string;
  station: string;
  route: string;
  schedule: string;
  about: string;
  from: string;
  to: string;
  findRoute: string;
  nearestStation: string;
  detectNearest: string;
  metersAway: string;
  nextTrainIn: string;
  nextTrain: string;
  minutes: string;
  seconds: string;
  direction: string;
  transfers: string;
  fare: string;
  operatingHours: string;
  crowdLevel: string;
  quickActions: string;
  favoriteRoutes: string;
  addFavorite: string;
  exitsAndStreets: string;
  facilities: string;
  firstAndLastTrain: string;
  allLines: string;
  searchStation: string;
  selectStation: string;
  setAsStart: string;
  setAsEnd: string;
  close: string;
  reminderTitle: string;
  setReminder: string;
  reminderSetMsg: string;
  feedbackTitle: string;
  sendFeedback: string;
  name: string;
  message: string;
  category: string;
  successFeedback: string;
  emergencyContacts: string;
  metroHotline: string;
  policeDesk: string;
  stationsCount: string;
  stops: string;
  totalTime: string;
  attoCard: string;
  cashOrQr: string;
  studentDiscount: string;
  uzs: string;
  trainMovingSimulation: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  darkTheme: string;
  lightTheme: string;
  linesOverview: string;
  alertsAndNews: string;
  filterByLine: string;
  noTransfers: string;
  oneTransfer: string;
  liveTrainCountdown: string;
  readyToBoard: string;
  reminderDescription: string;
  saveRoute: string;
  routeSaved: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  uz: {
    appName: "Toshkent Metro",
    appSubtitle: "Aqlli Yo'lboshchi",
    home: "Bosh sahifa",
    map: "Metro xaritasi",
    station: "Bekatlar",
    route: "Yo'nalish topish",
    schedule: "Jadval va xabarlar",
    about: "Biz haqimizda",
    from: "Qayerdan?",
    to: "Qayerga?",
    findRoute: "Yo'nalishni topish",
    nearestStation: "Eng yaqin bekat",
    detectNearest: "Joylashuvimni aniqlash",
    metersAway: "metr masofada",
    nextTrainIn: "Keyingi poyezd keladi",
    nextTrain: "Keyingi poyezd",
    minutes: "daq",
    seconds: "soniya",
    direction: "Yo'nalish",
    transfers: "O'tish joylari",
    fare: "Yo'l haqi",
    operatingHours: "Ish vaqti",
    crowdLevel: "Gavjumlik holati",
    quickActions: "Tezkor amallar",
    favoriteRoutes: "Sevimli yo'nalishlar",
    addFavorite: "Sevimliga qo'shish",
    exitsAndStreets: "Chiqish yo'llari va yaqin joylar",
    facilities: "Bekat qulayliklari",
    firstAndLastTrain: "Birinchi va oxirgi poyezd",
    allLines: "Barcha liniyalar",
    searchStation: "Bekat nomini qidiring...",
    selectStation: "Bekatni tanlang",
    setAsStart: "Boshlang'ich bekat",
    setAsEnd: "Boriladigan bekat",
    close: "Yopish",
    reminderTitle: "Poyezd eslatmasi",
    setReminder: "Eslatmani yoqish",
    reminderSetMsg: "Eslatma o'rnatildi! Poyezd yaqinlashganda ogohlantiramiz.",
    feedbackTitle: "Fikr-mulohaza va takliflar",
    sendFeedback: "Xabarni yuborish",
    name: "Ismingiz",
    message: "Xabaringiz / Fikringiz",
    category: "Mavzu",
    successFeedback: "Fikringiz uchun rahmat! Ma'lumot qabul qilindi.",
    emergencyContacts: "Favqulodda aloqa va navbatchilik",
    metroHotline: "Metropoliten ishonch telefoni",
    policeDesk: "Metro xavfsizlik xizmati (102)",
    stationsCount: "ta bekat",
    stops: "bekat",
    totalTime: "Umumiy vaqt",
    attoCard: "ATTO karta",
    cashOrQr: "QR / Bank karta",
    studentDiscount: "Talaba / Pensiya",
    uzs: "so'm",
    trainMovingSimulation: "Jonli harakat simulyatsiyasi",
    zoomIn: "Kattalashtirish",
    zoomOut: "Kichraytirish",
    resetView: "Asl holat",
    darkTheme: "Tungi rejim",
    lightTheme: "Kunduzgi rejim",
    linesOverview: "Liniyalar haqida",
    alertsAndNews: "Bugungi yangiliklar va e'lonlar",
    filterByLine: "Liniya bo'yicha saralash",
    noTransfers: "To'g'ridan-to'g'ri (o'tishsiz)",
    oneTransfer: "1 ta o'tish bilan",
    liveTrainCountdown: "Poyezd kelish hisoblagichi",
    readyToBoard: "Poyezd bekatga yaqinlashmoqda!",
    reminderDescription: "Poyezd bekatga kelishiga 5 daqiqa qolganda sizga ovozli va vizual xabar yuboriladi.",
    saveRoute: "Yo'nalishni saqlash",
    routeSaved: "Yo'nalish sevimlilarga saqlandi",
  },
  ru: {
    appName: "Ташкент Метро",
    appSubtitle: "Умный Навигатор",
    home: "Главная",
    map: "Карта метро",
    station: "Станции",
    route: "Маршрут",
    schedule: "Расписание и новости",
    about: "О нас",
    from: "Откуда?",
    to: "Куда?",
    findRoute: "Построить маршрут",
    nearestStation: "Ближайшая станция",
    detectNearest: "Определить локацию",
    metersAway: "метров от вас",
    nextTrainIn: "Следующий поезд через",
    nextTrain: "Следующий поезд",
    minutes: "мин",
    seconds: "сек",
    direction: "Направление",
    transfers: "Пересадки",
    fare: "Стоимость проезда",
    operatingHours: "Время работы",
    crowdLevel: "Загруженность",
    quickActions: "Быстрые действия",
    favoriteRoutes: "Избранные маршруты",
    addFavorite: "В избранное",
    exitsAndStreets: "Выходы и ориентиры",
    facilities: "Удобства станции",
    firstAndLastTrain: "Первый и последний поезд",
    allLines: "Все линии",
    searchStation: "Поиск станции...",
    selectStation: "Выберите станцию",
    setAsStart: "Отсюда",
    setAsEnd: "Сюда",
    close: "Закрыть",
    reminderTitle: "Напоминание о поезде",
    setReminder: "Включить напоминание",
    reminderSetMsg: "Напоминание включено! Мы уведомим вас о приближении поезда.",
    feedbackTitle: "Отзывы и предложения",
    sendFeedback: "Отправить сообщение",
    name: "Ваше имя",
    message: "Ваше сообщение",
    category: "Категория",
    successFeedback: "Спасибо за обратную связь! Сообщение принято.",
    emergencyContacts: "Экстренные контакты",
    metroHotline: "Горячая линия метрополитена",
    policeDesk: "Служба безопасности (102)",
    stationsCount: "станций",
    stops: "остановок",
    totalTime: "Общее время",
    attoCard: "Карта ATTO",
    cashOrQr: "QR / Банк. карта",
    studentDiscount: "Студенческий / Льготный",
    uzs: "сум",
    trainMovingSimulation: "Симуляция движения поездов",
    zoomIn: "Приблизить",
    zoomOut: "Отдалить",
    resetView: "Сброс",
    darkTheme: "Темная тема",
    lightTheme: "Светлая тема",
    linesOverview: "Обзор линий",
    alertsAndNews: "Новости и объявления",
    filterByLine: "Фильтр по линиям",
    noTransfers: "Прямой маршрут (без пересадок)",
    oneTransfer: "С 1 пересадкой",
    liveTrainCountdown: "Таймер прибытия поезда",
    readyToBoard: "Поезд подъезжает к платформе!",
    reminderDescription: "Мы уведомим вас за 5 минут до прибытия поезда на выбранную станцию.",
    saveRoute: "Сохранить маршрут",
    routeSaved: "Маршрут сохранен в избранное",
  },
  en: {
    appName: "Tashkent Metro",
    appSubtitle: "Smart Transit Guide",
    home: "Home",
    map: "Metro Map",
    station: "Stations",
    route: "Route Finder",
    schedule: "Timetable & Alerts",
    about: "About & Contact",
    from: "From station?",
    to: "To station?",
    findRoute: "Find Route",
    nearestStation: "Nearest Station",
    detectNearest: "Detect GPS Location",
    metersAway: "meters away",
    nextTrainIn: "Next train arrives in",
    nextTrain: "Next train",
    minutes: "min",
    seconds: "sec",
    direction: "Direction",
    transfers: "Transfers",
    fare: "Fare",
    operatingHours: "Operating Hours",
    crowdLevel: "Crowd Level",
    quickActions: "Quick Actions",
    favoriteRoutes: "Favorite Routes",
    addFavorite: "Save to Favorites",
    exitsAndStreets: "Exits & Nearby Landmarks",
    facilities: "Station Amenities",
    firstAndLastTrain: "First & Last Train",
    allLines: "All Lines",
    searchStation: "Search station name...",
    selectStation: "Select Station",
    setAsStart: "Set as Departure",
    setAsEnd: "Set as Destination",
    close: "Close",
    reminderTitle: "Train Arrival Reminder",
    setReminder: "Set Reminder Alert",
    reminderSetMsg: "Reminder set! You will be alerted before your train arrives.",
    feedbackTitle: "Feedback & Suggestions",
    sendFeedback: "Send Message",
    name: "Your Name",
    message: "Your Message",
    category: "Category",
    successFeedback: "Thank you for your feedback! Message received.",
    emergencyContacts: "Emergency & Dispatch Hotlines",
    metroHotline: "Metro Dispatch Helpline",
    policeDesk: "Transit Police Security (102)",
    stationsCount: "stations",
    stops: "stops",
    totalTime: "Total Travel Time",
    attoCard: "ATTO Smartcard",
    cashOrQr: "QR / Bank Card",
    studentDiscount: "Student / Senior Fare",
    uzs: "UZS",
    trainMovingSimulation: "Live Train Simulation",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetView: "Reset View",
    darkTheme: "Dark Mode",
    lightTheme: "Light Mode",
    linesOverview: "Lines Overview",
    alertsAndNews: "Today's Alerts & Announcements",
    filterByLine: "Filter by Line",
    noTransfers: "Direct (no transfers)",
    oneTransfer: "1 transfer required",
    liveTrainCountdown: "Train Arrival Countdown",
    readyToBoard: "Train approaching the platform!",
    reminderDescription: "Get an audio/visual notification 5 minutes before your train arrives.",
    saveRoute: "Save Route",
    routeSaved: "Route saved to favorites",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isDark: boolean;
  toggleTheme: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tashkent_metro_lang') as Language;
    return saved === 'ru' || saved === 'en' ? saved : 'uz';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('tashkent_metro_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tashkent_metro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tashkent_metro_theme', 'light');
    }
  }, [isDark]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tashkent_metro_lang', lang);
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isDark, toggleTheme }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
