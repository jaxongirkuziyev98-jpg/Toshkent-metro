import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TASHKENT_METRO_STATS } from '../data/metroData';
import {
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Shield,
  Train,
  Clock,
  Sparkles,
  MapPin,
  Building,
} from 'lucide-react';

export const AboutContactView: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Taklif');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setIsSubmitted(false);
    }, 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-8">
      {/* Hero Banner: About Tashkent Metro */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Train className="w-3.5 h-3.5" />
            <span>Markaziy Osiyodagi birinchi metropoliten (1977-yildan beri)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Toshkent Metro Yo'lboshchi haqida
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Bu sayt Toshkent metropoliteni yo'lovchilariga poyezdlar qachon kelishi, bekatlar qayerda joylashgani va qaysi yo'nalish eng qulay ekanini ko'rsatish maqsadida yaratilgan ochiq va zamonaviy raqamli yo'lboshchidir.
          </p>
        </div>

        {/* 4 Key Metro Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Liniyalar soni</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-1 block">
              {TASHKENT_METRO_STATS.totalLines} ta
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Qizil, Ko'k, Yashil, Halqa</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Jami bekatlar</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-1 block">
              {TASHKENT_METRO_STATS.totalStations} ta
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Yerosti va zamonaviy estakada</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Kunlik yo'lovchilar</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tabular-nums mt-1 block">
              {TASHKENT_METRO_STATS.dailyPassengers}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">O'rtacha kunlik qatnov</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Umumiy yo'l uzunligi</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 block">
              {TASHKENT_METRO_STATS.totalTrackKm} km
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Butun Toshkent bo'ylab</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Feedback Form & Emergency Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feedback Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.feedbackTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Metro faoliyatini yanada yaxshilash, bekatlar tozaligi yoki poyezdlar harakatlanishiga oid takliflaringizni yuboring.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                {t.successFeedback}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Sizning fikringiz navbatchi dispetcherlik xizmatiga muvaffaqiyatli yetkazildi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Sardor Aliyev"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mavzu toifasi
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Taklif">Yangi taklif va tashabbus</option>
                  <option value="Oraliq">Poyezd oralig'i va kutish vaqti</option>
                  <option value="Tozalik">Bekat va vagonlar tozaligi</option>
                  <option value="Xavfsizlik">Xavfsizlik va eskalatorlar</option>
                  <option value="ATTO">To'lov va ATTO validatorlari</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.message}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Fikringiz, uchragan holat yoki taklifingizni bu yerga yozing..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{t.sendFeedback}</span>
              </button>
            </form>
          )}
        </div>

        {/* Emergency Contacts & Hotlines (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.emergencyContacts}
            </h3>
          </div>

          <div className="space-y-3">
            {/* Metro Hotline */}
            <a
              href="tel:+998712325018"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between hover:border-blue-500 transition-colors group block"
            >
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {t.metroHotline}
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  +998 (71) 232-50-18
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">24/7 navbatchi dispetcher</span>
              </div>
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </a>

            {/* Police Security 102 */}
            <a
              href="tel:102"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between hover:border-red-500 transition-colors group block"
            >
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {t.policeDesk}
                </span>
                <span className="text-base font-bold font-mono text-red-600 dark:text-red-400">
                  102
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Metro xavfsizlik boshqarmasi</span>
              </div>
              <Shield className="w-5 h-5 text-red-500" />
            </a>

            {/* Metro Office Address */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Metropoliten boshqarmasi manzili:
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Toshkent shahri, Islom Karimov ko'chasi, 99-uy
              </p>
              <p className="text-xs text-slate-400">
                Mo'ljal: "Kosmonavtlar" yoki "O'zbekiston" metro bekatlari
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
