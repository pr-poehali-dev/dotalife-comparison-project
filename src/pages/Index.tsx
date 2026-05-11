import { useState } from "react";
import Icon from "@/components/ui/icon";

const NAV_ITEMS = [
  { label: "Герои", icon: "Sword" },
  { label: "Статистика", icon: "BarChart3" },
  { label: "Предметы", icon: "Package" },
  { label: "Матчи", icon: "Swords" },
  { label: "Игроки", icon: "Users" },
  { label: "Турниры", icon: "Trophy" },
  { label: "Рейтинги", icon: "Star" },
  { label: "Гайды", icon: "BookOpen" },
];

const HEROES = [
  { name: "Invoker", role: "Маг", winrate: 52.3, tier: "S", color: "#E84A30", hasVideo: true },
  { name: "Anti-Mage", role: "Керри", winrate: 49.1, tier: "A", color: "#2563EB", hasVideo: true },
  { name: "Pudge", role: "Поддержка", winrate: 47.8, tier: "B", color: "#16A34A", hasVideo: true },
  { name: "Crystal Maiden", role: "Поддержка", winrate: 51.2, tier: "A", color: "#0891B2", hasVideo: false },
  { name: "Phantom Assassin", role: "Керри", winrate: 50.7, tier: "A", color: "#7C3AED", hasVideo: true },
  { name: "Axe", role: "Инициатор", winrate: 48.9, tier: "B", color: "#DC2626", hasVideo: false },
];

const MATCHES = [
  { id: "#8234891", team1: "Team Spirit", team2: "OG", score: "2:1", duration: "38:22", when: "2 ч назад" },
  { id: "#8234882", team1: "Liquid", team2: "EG", score: "0:2", duration: "29:14", when: "5 ч назад" },
  { id: "#8234877", team1: "Navi", team2: "VP", score: "2:0", duration: "44:07", when: "8 ч назад" },
];

const GUIDES = [
  { title: "Invoker: полный гайд 2026", author: "Miracle-", views: "241K", duration: "34:12", tier: "Про" },
  { title: "Anti-Mage: фарм маршруты", author: "Topson", views: "187K", duration: "22:45", tier: "Про" },
  { title: "Pudge: крюки и позиционирование", author: "Dendi", views: "312K", duration: "28:03", tier: "Легенда" },
];

const PLAYERS = [
  { rank: 1, name: "Miracle-", team: "Nigma", mmr: 12847, trend: "up" },
  { rank: 2, name: "Topson", team: "OG", mmr: 12504, trend: "up" },
  { rank: 3, name: "Dendi", team: "B8", mmr: 11923, trend: "down" },
  { rank: 4, name: "YapzOr", team: "Tundra", mmr: 11701, trend: "same" },
  { rank: 5, name: "Matumbaman", team: "Liquid", mmr: 11580, trend: "up" },
];

const TOURNAMENTS = [
  { name: "The International 2026", prize: "$40,000,000", status: "live", date: "15–25 авг" },
  { name: "ESL One Malaysia", prize: "$1,500,000", status: "soon", date: "1–10 июн" },
  { name: "DreamLeague S23", prize: "$1,000,000", status: "finished", date: "20–28 апр" },
];

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#E84A30] text-white",
  A: "bg-[#1a1a1a] text-white",
  B: "bg-gray-200 text-gray-700",
};

export default function Index() {
  const [activeSection, setActiveSection] = useState("Герои");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-body">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E84A30] rounded-sm flex items-center justify-center">
                <span className="text-white font-display text-sm font-bold">DL</span>
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-[#1a1a1a]">
                Dota<span className="text-[#E84A30]">Life</span>
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveSection(item.label)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    activeSection === item.label
                      ? "bg-[#E84A30] text-white"
                      : "text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100"
                  }`}
                >
                  <Icon name={item.icon} size={14} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-48">
                <Icon name="Search" size={14} className="text-gray-400" />
                <input
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                  placeholder="Поиск..."
                />
              </div>
              <button className="hidden md:block bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#E84A30] transition-colors duration-200">
                Войти
              </button>
              <button
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
            <div className="grid grid-cols-2 gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setActiveSection(item.label); setMobileMenuOpen(false); }}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeSection === item.label
                      ? "bg-[#E84A30] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon name={item.icon} size={14} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="bg-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E84A30] opacity-5 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#E84A30] opacity-5 blur-2xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E84A30]/20 border border-[#E84A30]/30 rounded-full px-3 py-1 mb-5">
                <span className="w-2 h-2 bg-[#E84A30] rounded-full animate-pulse" />
                <span className="text-[#E84A30] text-xs font-medium tracking-wider uppercase">The International 2026 · Live</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold leading-none mb-4 tracking-tight">
                Всё о <span className="text-[#E84A30]">Dota 2</span><br />в одном месте
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Герои, матчи, статистика и видеогайды от профессиональных игроков — для тех, кто хочет расти.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-[#E84A30] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#cf3d26] transition-colors">
                  Смотреть гайды
                </button>
                <button className="border border-gray-600 text-gray-300 font-medium px-6 py-3 rounded-lg hover:border-gray-400 hover:text-white transition-colors">
                  Найти матч
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "124", label: "Героя", icon: "Sword" },
                { value: "2.4M", label: "Матчей сегодня", icon: "Swords" },
                { value: "48K", label: "Видеогайдов", icon: "Play" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">
                  <Icon name={stat.icon} size={22} className="text-[#E84A30] mx-auto mb-2" />
                  <div className="font-display text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* HEROES */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">Герои</h2>
              <p className="text-gray-500 text-sm mt-0.5">Актуальный патч · Топ по винрейту</p>
            </div>
            <button className="text-sm text-[#E84A30] font-medium hover:underline flex items-center gap-1">
              Все герои <Icon name="ChevronRight" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {HEROES.map((hero) => (
              <div
                key={hero.name}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="relative h-28 flex items-center justify-center" style={{ backgroundColor: hero.color + "15" }}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold text-white"
                    style={{ backgroundColor: hero.color }}
                  >
                    {hero.name[0]}
                  </div>
                  <span className={`absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[hero.tier]}`}>
                    {hero.tier}
                  </span>
                  {hero.hasVideo && (
                    <span className="absolute top-2 right-2 bg-[#E84A30] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Icon name="Play" size={9} />
                      Видео
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-[#1a1a1a] text-sm truncate">{hero.name}</div>
                  <div className="text-gray-400 text-xs">{hero.role}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Винрейт</span>
                    <span className={`text-xs font-bold ${hero.winrate >= 50 ? "text-green-600" : "text-red-500"}`}>
                      {hero.winrate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MATCHES + PLAYERS */}
        <div className="grid lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">Матчи</h2>
                <p className="text-gray-500 text-sm mt-0.5">Последние результаты</p>
              </div>
              <button className="text-sm text-[#E84A30] font-medium hover:underline flex items-center gap-1">
                Все матчи <Icon name="ChevronRight" size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {MATCHES.map((match) => (
                <div key={match.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xs text-gray-400 font-mono w-20">{match.id}</span>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-semibold text-[#1a1a1a] text-sm">{match.team1}</span>
                        <span className="font-display text-lg font-bold text-[#1a1a1a] bg-gray-100 px-3 py-0.5 rounded-lg">{match.score}</span>
                        <span className="font-semibold text-[#1a1a1a] text-sm">{match.team2}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-500">{match.duration}</div>
                      <div className="text-xs text-gray-400">{match.when}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">Рейтинг</h2>
                <p className="text-gray-500 text-sm mt-0.5">Топ игроки мира</p>
              </div>
              <button className="text-sm text-[#E84A30] font-medium hover:underline flex items-center gap-1">
                Все <Icon name="ChevronRight" size={14} />
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {PLAYERS.map((player) => (
                <div key={player.name} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className={`w-6 text-center text-sm font-bold ${player.rank === 1 ? "text-[#E84A30]" : "text-gray-400"}`}>
                    {player.rank}
                  </span>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">{player.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1a1a1a] text-sm truncate">{player.name}</div>
                    <div className="text-xs text-gray-400">{player.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#1a1a1a]">{player.mmr.toLocaleString()}</div>
                    <Icon
                      name={player.trend === "up" ? "TrendingUp" : player.trend === "down" ? "TrendingDown" : "Minus"}
                      size={12}
                      className={player.trend === "up" ? "text-green-500" : player.trend === "down" ? "text-red-500" : "text-gray-400"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VIDEO GUIDES */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">Видеогайды от профи</h2>
              <p className="text-gray-500 text-sm mt-0.5">Обучайся у лучших игроков мира</p>
            </div>
            <button className="text-sm text-[#E84A30] font-medium hover:underline flex items-center gap-1">
              Все гайды <Icon name="ChevronRight" size={14} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDES.map((guide) => (
              <div
                key={guide.title}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="h-44 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] relative flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#E84A30] transition-colors duration-200">
                    <Icon name="Play" size={24} className="text-white translate-x-0.5" />
                  </div>
                  <span className="absolute top-3 left-3 bg-[#E84A30] text-white text-xs font-medium px-2 py-0.5 rounded">
                    {guide.tier}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {guide.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1a1a1a] mb-2 leading-snug">{guide.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#E84A30] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{guide.author[0]}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{guide.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Icon name="Eye" size={12} />
                      <span className="text-xs">{guide.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TOURNAMENTS */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">Турниры</h2>
              <p className="text-gray-500 text-sm mt-0.5">Текущие и предстоящие события</p>
            </div>
            <button className="text-sm text-[#E84A30] font-medium hover:underline flex items-center gap-1">
              Все турниры <Icon name="ChevronRight" size={14} />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TOURNAMENTS.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <Icon name="Trophy" size={20} className="text-[#E84A30]" />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.status === "live"
                        ? "bg-green-100 text-green-700"
                        : t.status === "soon"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.status === "live" ? "🔴 Live" : t.status === "soon" ? "Скоро" : "Завершён"}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1 text-sm leading-snug">{t.name}</h3>
                <div className="text-xs text-gray-400 mb-2">{t.date}</div>
                <div className="font-display text-lg font-bold text-[#E84A30]">{t.prize}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-gray-400 py-10 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#E84A30] rounded-sm flex items-center justify-center">
                <span className="text-white font-display text-xs font-bold">DL</span>
              </div>
              <span className="font-display text-white font-bold">DotaLife</span>
            </div>
            <div className="flex gap-6 text-sm">
              {["Герои", "Матчи", "Турниры", "Гайды"].map((item) => (
                <button key={item} className="hover:text-white transition-colors">{item}</button>
              ))}
            </div>
            <div className="text-xs text-gray-600">© 2026 DotaLife. Все права защищены.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}