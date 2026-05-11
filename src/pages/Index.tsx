import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/1b571a81-6a53-46ef-b860-58eb38a8cda6";
const REVIEWS_URL = "https://functions.poehali.dev/cb55cf00-094f-46ed-ae4b-b3e2f7971959";

function useAuth() {
  const [user, setUser] = useState<{ id: number; name: string; email: string; avatar: string; provider: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("dl_token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${AUTH_URL}?action=me`, { headers: { "X-Session-Token": token } });
      const data = await res.json();
      setUser(data.user || null);
    } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Обработка OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("dl_token", token);
      window.history.replaceState({}, "", window.location.pathname);
    }
    fetchMe();
  }, [fetchMe]);

  const logout = async () => {
    const token = localStorage.getItem("dl_token");
    if (token) await fetch(`${AUTH_URL}?action=logout`, { method: "POST", headers: { "X-Session-Token": token } });
    localStorage.removeItem("dl_token");
    setUser(null);
  };

  return { user, loading, logout, refetch: fetchMe };
}

function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <Icon name="X" size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#E84A30] rounded-sm flex items-center justify-center">
            <span className="text-white font-display text-sm font-bold">DL</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#1a1a1a]">Войти в DotaLife</h2>
            <p className="text-gray-400 text-xs">Чтобы оставить отзыв и сохранять данные</p>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`${AUTH_URL}?provider=google`}
            className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-[#1a1a1a]">Продолжить с Google</span>
          </a>

          <a
            href={`${AUTH_URL}?provider=vk`}
            className="flex items-center gap-3 w-full bg-[#0077FF] rounded-xl px-4 py-3 hover:bg-[#0066DD] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="white">
              <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm2.68 13.5h-1.5c-.57 0-.74-.45-1.76-1.5-.88-.9-1.27-.9-1.5-.9-.3 0-.39.09-.39.52v1.36c0 .37-.12.6-1.1.6-1.62 0-3.41-.98-4.67-2.8C5.64 10.5 5.1 8.7 5.1 8.3c0-.23.09-.45.52-.45h1.5c.39 0 .54.18.69.6.76 2.2 2.04 4.13 2.57 4.13.2 0 .29-.09.29-.6V9.96c-.06-1.08-.63-1.17-.63-1.55 0-.18.15-.37.39-.37h2.36c.33 0 .45.18.45.57v3.06c0 .33.15.45.24.45.2 0 .36-.12.72-.48 1.11-1.25 1.9-3.17 1.9-3.17.1-.23.3-.45.69-.45h1.5c.45 0 .55.23.45.57-.19.88-2.04 3.5-2.04 3.5-.16.26-.22.38 0 .67.16.21.69.67 1.04 1.08.65.74 1.14 1.36 1.27 1.79.13.42-.09.63-.52.63z"/>
            </svg>
            <span className="text-sm font-medium text-white">Продолжить с ВКонтакте</span>
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Входя, вы соглашаетесь с правилами сайта
        </p>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { label: "Герои", icon: "Sword" },
  { label: "Статистика", icon: "BarChart3" },
  { label: "Предметы", icon: "Package" },
  { label: "Матчи", icon: "Swords" },
  { label: "Игроки", icon: "Users" },
  { label: "Турниры", icon: "Trophy" },
  { label: "Рейтинги", icon: "Star" },
  { label: "Гайды", icon: "BookOpen" },
  { label: "Отзывы", icon: "MessageSquare" },
];

const HERO_IMAGES: Record<string, string> = {
  "Invoker": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/invoker.png",
  "Anti-Mage": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png",
  "Pudge": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pudge.png",
  "Crystal Maiden": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/crystal_maiden.png",
  "Phantom Assassin": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png",
  "Axe": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png",
  "Lion": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lion.png",
  "Juggernaut": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/juggernaut.png",
  "Lina": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lina.png",
  "Earthshaker": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/earthshaker.png",
  "Drow Ranger": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/drow_ranger.png",
  "Storm Spirit": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png",
};

const HEROES = [
  { name: "Invoker", role: "Маг", winrate: 52.3, tier: "S", color: "#E84A30", hasVideo: true },
  { name: "Anti-Mage", role: "Керри", winrate: 49.1, tier: "A", color: "#2563EB", hasVideo: true },
  { name: "Pudge", role: "Поддержка", winrate: 47.8, tier: "B", color: "#16A34A", hasVideo: true },
  { name: "Crystal Maiden", role: "Поддержка", winrate: 51.2, tier: "A", color: "#0891B2", hasVideo: false },
  { name: "Phantom Assassin", role: "Керри", winrate: 50.7, tier: "A", color: "#7C3AED", hasVideo: true },
  { name: "Axe", role: "Инициатор", winrate: 48.9, tier: "B", color: "#DC2626", hasVideo: false },
  { name: "Lion", role: "Поддержка", winrate: 50.1, tier: "A", color: "#D97706", hasVideo: true },
  { name: "Juggernaut", role: "Керри", winrate: 48.5, tier: "B", color: "#059669", hasVideo: false },
  { name: "Lina", role: "Маг", winrate: 51.8, tier: "A", color: "#DB2777", hasVideo: true },
  { name: "Earthshaker", role: "Инициатор", winrate: 47.2, tier: "B", color: "#92400E", hasVideo: false },
  { name: "Drow Ranger", role: "Керри", winrate: 53.1, tier: "S", color: "#1D4ED8", hasVideo: true },
  { name: "Storm Spirit", role: "Маг", winrate: 49.8, tier: "A", color: "#4338CA", hasVideo: true },
];

const MATCHES = [
  { id: "#8234891", team1: "Team Spirit", team2: "OG", score: "2:1", duration: "38:22", when: "2 ч назад", map: "Карта 3" },
  { id: "#8234882", team1: "Liquid", team2: "EG", score: "0:2", duration: "29:14", when: "5 ч назад", map: "Карта 2" },
  { id: "#8234877", team1: "Navi", team2: "VP", score: "2:0", duration: "44:07", when: "8 ч назад", map: "Карта 2" },
  { id: "#8234860", team1: "Tundra", team2: "Secret", score: "1:2", duration: "51:33", when: "12 ч назад", map: "Карта 3" },
  { id: "#8234843", team1: "Fnatic", team2: "Alliance", score: "2:1", duration: "37:48", when: "1 д назад", map: "Карта 3" },
  { id: "#8234820", team1: "PSG.LGD", team2: "Aster", score: "2:0", duration: "26:19", when: "1 д назад", map: "Карта 2" },
];

const GUIDES = [
  { title: "Invoker: полный гайд 2026", author: "Serligo", views: "241K", duration: "34:12", tier: "Про", hero: "Invoker", videoId: "6wSvk5P1D_I" },
  { title: "Anti-Mage: фарм маршруты", author: "arteans", views: "187K", duration: "22:45", tier: "Про", hero: "Anti-Mage", videoId: "F9GnFofl6ns" },
  { title: "Pudge: крюки и позиционирование", author: "Dota_helper", views: "312K", duration: "28:03", tier: "Легенда", hero: "Pudge", videoId: "yFyamgrBq30" },
  { title: "Crystal Maiden: расстановка вардов", author: "Soshiteru", views: "98K", duration: "18:30", tier: "Про", hero: "Crystal Maiden", videoId: "Jp5AMfYTN6Y" },
  { title: "Phantom Assassin: выбор предметов", author: "hitaro", views: "155K", duration: "25:10", tier: "Легенда", hero: "Phantom Assassin", videoId: "Jt8MDCcnfAw" },
  { title: "Lina: агрессивная мид-линия", author: "Dota_helper", views: "203K", duration: "31:05", tier: "Про", hero: "Lina", videoId: "fwHUFUFwQrA" },
];

const PLAYERS = [
  { rank: 1, name: "Miracle-", team: "Nigma", mmr: 12847, trend: "up", country: "🇯🇴" },
  { rank: 2, name: "Topson", team: "OG", mmr: 12504, trend: "up", country: "🇫🇮" },
  { rank: 3, name: "Dendi", team: "B8", mmr: 11923, trend: "down", country: "🇺🇦" },
  { rank: 4, name: "YapzOr", team: "Tundra", mmr: 11701, trend: "same", country: "🇸🇦" },
  { rank: 5, name: "Matumbaman", team: "Liquid", mmr: 11580, trend: "up", country: "🇫🇮" },
  { rank: 6, name: "Nisha", team: "Secret", mmr: 11402, trend: "up", country: "🇷🇸" },
  { rank: 7, name: "ana", team: "OG", mmr: 11298, trend: "down", country: "🇦🇺" },
  { rank: 8, name: "33", team: "Tundra", mmr: 11187, trend: "same", country: "🇳🇴" },
];

const TOURNAMENTS = [
  { name: "The International 2026", prize: "$40,000,000", status: "live", date: "15–25 авг", teams: 18, location: "Стокгольм" },
  { name: "ESL One Malaysia", prize: "$1,500,000", status: "soon", date: "1–10 июн", teams: 12, location: "Куала-Лумпур" },
  { name: "DreamLeague S23", prize: "$1,000,000", status: "finished", date: "20–28 апр", teams: 8, location: "Онлайн" },
  { name: "BetBoom Dacha", prize: "$500,000", status: "finished", date: "5–12 мар", teams: 8, location: "Дубай" },
  { name: "ESL One Birmingham", prize: "$1,000,000", status: "soon", date: "18–26 июл", teams: 12, location: "Бирмингем" },
  { name: "PGL Wallachia S3", prize: "$600,000", status: "finished", date: "10–18 фев", teams: 8, location: "Онлайн" },
];

const CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items";

const ITEMS = [
  // Оружие
  { name: "Daedalus", type: "Оружие", cost: 5350, color: "#0891B2", winrate: 57.4, img: `${CDN}/greater_crit.png`, desc: "Даёт шанс нанести критический урон ×225% при атаке. Один из мощнейших предметов для керри-героев." },
  { name: "Bloodthorn", type: "Оружие", cost: 6800, color: "#DC2626", winrate: 53.9, img: `${CDN}/bloodthorn.png`, desc: "Обездвиживает цель, заставляя её получать критический урон от каждой атаки. Орбовый эффект замедляет атаку врага." },
  { name: "Monkey King Bar", type: "Оружие", cost: 4975, color: "#D97706", winrate: 54.8, img: `${CDN}/monkey_king_bar.png`, desc: "Даёт шанс нанести мини-оглушение при атаке. Пробивает уклонение — идеален против PA и Windranger." },
  { name: "Mjollnir", type: "Оружие", cost: 5600, color: "#4338CA", winrate: 53.2, img: `${CDN}/mjollnir.png`, desc: "При атаке бьёт молнией по соседним врагам. Активная способность: щит молний защищает союзника." },
  { name: "Ethereal Blade", type: "Оружие", cost: 4700, color: "#7C3AED", winrate: 52.1, img: `${CDN}/ethereal_blade.png`, desc: "Переводит цель в эфирное состояние — она не может атаковать, но получает +40% урона от магии. Мощь для магов." },
  { name: "Rapier", type: "Оружие", cost: 6200, color: "#E84A30", winrate: 51.0, img: `${CDN}/rapier.png`, desc: "Даёт +280 к чистому урону. При смерти выпадает и может быть подобрана врагом. Для тех, кто идёт ва-банк." },

  // Броня
  { name: "Black King Bar", type: "Броня", cost: 4050, color: "#D97706", winrate: 54.1, img: `${CDN}/black_king_bar.png`, desc: "Активирует магическую неуязвимость на 4–10 секунд. Спасает от контроля и массовых заклинаний противника." },
  { name: "Satanic", type: "Броня", cost: 5050, color: "#6D28D9", winrate: 52.8, img: `${CDN}/satanic.png`, desc: "Пассивно даёт лайфстил. Активная способность: 3 секунды 175% лайфстила — позволяет восстановить все HP в бою." },
  { name: "Shiva's Guard", type: "Броня", cost: 4850, color: "#0891B2", winrate: 53.5, img: `${CDN}/shivas_guard.png`, desc: "Активна: ледяная волна замедляет врагов. Пассивно снижает скорость их атаки. Незаменим для инициаторов." },
  { name: "Heart of Tarrasque", type: "Броня", cost: 5000, color: "#DC2626", winrate: 55.6, img: `${CDN}/heart.png`, desc: "Даёт 45 силы и +1060 HP. Восстанавливает 1.6% от макс. HP в секунду вне боя. Делает героя практически неубиваемым." },
  { name: "Assault Cuirass", type: "Броня", cost: 5300, color: "#16A34A", winrate: 54.3, img: `${CDN}/assault.png`, desc: "Даёт +10 брони союзникам и снижает броню врагов на -5. Ауры складываются и дают огромное преимущество в командных боях." },
  { name: "Crimson Guard", type: "Броня", cost: 3700, color: "#B91C1C", winrate: 53.0, img: `${CDN}/crimson_guard.png`, desc: "Активный щит поглощает урон для команды. Незаменим против героев с множеством атак (Phantom Lancer, Medusa)." },

  // Артефакт
  { name: "Blink Dagger", type: "Артефакт", cost: 2250, color: "#E84A30", winrate: 55.7, img: `${CDN}/blink.png`, desc: "Телепортирует героя на 1200 единиц в выбранном направлении. Базовый предмет инициации и побега для большинства героев." },
  { name: "Force Staff", type: "Артефакт", cost: 2200, color: "#2563EB", winrate: 54.0, img: `${CDN}/force_staff.png`, desc: "Толкает себя или союзника на 600 единиц вперёд. Универсальный предмет: спасение, инициация, преследование." },
  { name: "Shadow Blade", type: "Артефакт", cost: 3000, color: "#4B5563", winrate: 52.5, img: `${CDN}/invis_sword.png`, desc: "Уходит в невидимость для инициации или отхода. Атака из невидимости наносит 175 бонусного урона." },
  { name: "Scythe of Vyse", type: "Артефакт", cost: 5675, color: "#16A34A", winrate: 56.9, img: `${CDN}/sheepstick.png`, desc: "Превращает врага в свинью на 3.5 секунды. Лучший хардовый контроль в игре — снимает BKB и блокирует все способности." },
  { name: "Orchid Malevolence", type: "Артефакт", cost: 3475, color: "#9333EA", winrate: 53.7, img: `${CDN}/orchid.png`, desc: "Глушит врага на 5 секунд, накапливая 30% от всего нанесённого урона — которые выплёскиваются в конце эффекта." },
  { name: "Eul's Scepter", type: "Артефакт", cost: 2725, color: "#0EA5E9", winrate: 53.1, img: `${CDN}/cyclone.png`, desc: "Поднимает цель в воздух на 2.5 секунды, делая её неуязвимой. Позволяет уйти от контроля или настроить заклинания." },

  // Аксессуар
  { name: "Aghanim's Scepter", type: "Аксессуар", cost: 4200, color: "#7C3AED", winrate: 58.2, img: `${CDN}/ultimate_scepter.png`, desc: "Улучшает ультимейт или одну из способностей героя. Эффект уникален для каждого из 124 героев." },
  { name: "Linken's Sphere", type: "Аксессуар", cost: 4700, color: "#2563EB", winrate: 56.3, img: `${CDN}/sphere.png`, desc: "Блокирует одно враждебное заклинание раз в 14 секунд. Лучшая защита от точечного контроля (hex, hex, hex)." },
  { name: "Eye of Skadi", type: "Аксессуар", cost: 5400, color: "#16A34A", winrate: 55.0, img: `${CDN}/skadi.png`, desc: "Атаки замедляют врага — его скорость передвижения и атаки снижаются. Нейтрализует лайфстил у вражеских керри." },
  { name: "Manta Style", type: "Аксессуар", cost: 4600, color: "#059669", winrate: 54.7, img: `${CDN}/manta.png`, desc: "Создаёт двух иллюзий героя на 20 секунд. Снимает большинство эффектов силенса и замедлений при активации." },
  { name: "Butterfly", type: "Аксессуар", cost: 4975, color: "#DB2777", winrate: 55.3, img: `${CDN}/butterfly.png`, desc: "Даёт 35% уклонение от физических атак и +30 к ловкости. Превращает ловких героев в неуловимых убийц." },
  { name: "Aegis of the Immortal", type: "Аксессуар", cost: 0, color: "#F59E0B", winrate: 61.0, img: `${CDN}/aegis.png`, desc: "Выпадает с Рошана. Возрождает героя с полным HP и маной на месте гибели. Можно взять только один раз." },

  // Мем
  { name: "Tango", type: "Мем", cost: 90, color: "#16A34A", winrate: 99.9, img: `${CDN}/tango.png`, desc: "Съедает дерево, восстанавливая HP. Легендарный предмет, известный по мему «12 танго». Просто купи 12 танго.", meme: true },
];

const STATS = [
  { label: "Матчей сыграно сегодня", value: "2,418,293", icon: "Swords", delta: "+12%" },
  { label: "Средняя длительность", value: "38:41", icon: "Clock", delta: "-2 мин" },
  { label: "Самый популярный герой", value: "Pudge", icon: "Sword", delta: "15.2% пиков" },
  { label: "Активных игроков", value: "847K", icon: "Users", delta: "онлайн" },
];

const POPULAR_HEROES_STATS = [
  { name: "Pudge", pickrate: 15.2, winrate: 47.8, banrate: 3.1, color: "#16A34A" },
  { name: "Invoker", pickrate: 12.8, winrate: 52.3, banrate: 8.4, color: "#E84A30" },
  { name: "Lion", pickrate: 11.4, winrate: 50.1, banrate: 2.7, color: "#D97706" },
  { name: "Crystal Maiden", pickrate: 10.9, winrate: 51.2, banrate: 4.2, color: "#0891B2" },
  { name: "Anti-Mage", pickrate: 9.7, winrate: 49.1, banrate: 11.3, color: "#2563EB" },
];

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#E84A30] text-white",
  A: "bg-[#1a1a1a] text-white",
  B: "bg-gray-200 text-gray-700",
};

const RATINGS = [
  { rank: 1, name: "Miracle-", team: "Nigma", mmr: 12847, wins: 1243, losses: 891, winrate: 58.3, country: "🇯🇴" },
  { rank: 2, name: "Topson", team: "OG", mmr: 12504, wins: 1102, losses: 812, winrate: 57.6, country: "🇫🇮" },
  { rank: 3, name: "Dendi", team: "B8", mmr: 11923, wins: 2341, losses: 1987, winrate: 54.1, country: "🇺🇦" },
  { rank: 4, name: "YapzOr", team: "Tundra", mmr: 11701, wins: 987, losses: 823, winrate: 54.5, country: "🇸🇦" },
  { rank: 5, name: "Matumbaman", team: "Liquid", mmr: 11580, wins: 1456, losses: 1231, winrate: 54.2, country: "🇫🇮" },
  { rank: 6, name: "Nisha", team: "Secret", mmr: 11402, wins: 1321, losses: 1104, winrate: 54.5, country: "🇷🇸" },
  { rank: 7, name: "ana", team: "OG", mmr: 11298, wins: 876, losses: 743, winrate: 54.1, country: "🇦🇺" },
  { rank: 8, name: "33", team: "Tundra", mmr: 11187, wins: 1034, losses: 912, winrate: 53.2, country: "🇳🇴" },
  { rank: 9, name: "Puppey", team: "Secret", mmr: 11042, wins: 3201, losses: 2798, winrate: 53.4, country: "🇪🇪" },
  { rank: 10, name: "KuroKy", team: "Nigma", mmr: 10987, wins: 2876, losses: 2541, winrate: 53.1, country: "🇩🇪" },
];

function NavHeader({ activeSection, setActiveSection, mobileMenuOpen, setMobileMenuOpen, user, onLogin, onLogout }: {
  activeSection: string;
  setActiveSection: (s: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  user: ReturnType<typeof useAuth>["user"];
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button className="flex items-center gap-3" onClick={() => setActiveSection("Герои")}>
            <div className="w-8 h-8 bg-[#E84A30] rounded-sm flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">DL</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[#1a1a1a]">
              Dota<span className="text-[#E84A30]">Life</span>
            </span>
          </button>

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
              <input className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" placeholder="Поиск..." />
            </div>
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setActiveSection("Отзывы")} className="text-sm text-gray-500 hover:text-[#1a1a1a] transition-colors px-2 py-1">Отзывы</button>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 cursor-pointer group relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 bg-[#E84A30] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name[0]}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1a1a1a] max-w-[100px] truncate">{user.name}</span>
                  <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1">
                    <Icon name="LogOut" size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={onLogin} className="hidden md:block bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#E84A30] transition-colors duration-200">
                Войти
              </button>
            )}
            <button className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                  activeSection === item.label ? "bg-[#E84A30] text-white" : "text-gray-600 hover:bg-gray-100"
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
  );
}

function SectionHeader({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">{title}</h2>
        <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
      </div>
      {action && onAction && (
        <button onClick={onAction} className="text-sm text-[#E84A30] font-medium hover:underline flex items-center gap-1">
          {action} <Icon name="ChevronRight" size={14} />
        </button>
      )}
    </div>
  );
}

function PagePudge({ onGo }: { onGo: (s: string) => void }) {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const abilities = [
    { name: "Meat Hook", key: "Q", desc: "Запускает крюк, который захватывает первую цель на пути и подтягивает её к Пуджу, нанося урон.", dmg: "100 / 180 / 260 / 340", cd: "14 / 13 / 12 / 11", mana: "110" },
    { name: "Rot", key: "W", desc: "Пудж испускает облако токсичного газа вокруг себя, нанося урон себе и врагам, замедляя их.", dmg: "30 / 60 / 90 / 120", cd: "0", mana: "0" },
    { name: "Flesh Heap", key: "E", desc: "Пассивная способность. Пудж набирает стаки силы при убийстве героев и получении урона. Даёт сопротивление магии.", dmg: "+2 / 3 / 4 / 5 силы", cd: "—", mana: "—" },
    { name: "Dismember", key: "R", desc: "Пудж обездвиживает и поглощает вражеского героя, нанося огромный магический урон в течение 3 секунд.", dmg: "100 / 200 / 300 + сила", cd: "30 / 20 / 10", mana: "200 / 300 / 400" },
  ];

  const startItems = [
    { name: "Tango", cost: 90, img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tango.png" },
    { name: "Healing Salve", cost: 100, img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/flask.png" },
    { name: "Orb of Venom", cost: 275, img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/orb_of_venom.png" },
    { name: "Clarity", cost: 50, img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/clarity.png" },
  ];

  const coreItems = [
    { name: "Blink Dagger", cost: 2250, role: "Основа", img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blink.png" },
    { name: "Hood of Defiance", cost: 2275, role: "Основа", img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hood_of_defiance.png" },
    { name: "Aghanim's Scepter", cost: 4200, role: "Ключевой", img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_scepter.png" },
    { name: "Black King Bar", cost: 4050, role: "Ключевой", img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png" },
    { name: "Heart of Tarrasque", cost: 5000, role: "Поздняя", img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/heart.png" },
    { name: "Shiva's Guard", cost: 4850, role: "Поздняя", img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/shivas_guard.png" },
  ];

  const stats = [
    { label: "Пикрейт", value: "15.2%", color: "text-[#E84A30]" },
    { label: "Винрейт", value: "47.8%", color: "text-red-500" },
    { label: "Банрейт", value: "3.1%", color: "text-gray-600" },
    { label: "Сложность", value: "★★★", color: "text-amber-500" },
  ];

  const roleColors: Record<string, string> = {
    "Основа": "bg-blue-100 text-blue-700",
    "Ключевой": "bg-[#E84A30]/10 text-[#E84A30]",
    "Поздняя": "bg-purple-100 text-purple-700",
  };

  return (
    <div className="py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => onGo("Герои")} className="hover:text-[#E84A30] transition-colors">Герои</button>
        <Icon name="ChevronRight" size={14} />
        <span className="text-[#1a1a1a] font-medium">Pudge</span>
      </div>

      {/* Hero Header */}
      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden mb-8 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#16A34A] blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative grid lg:grid-cols-3 gap-0">
          {/* Portrait */}
          <div className="relative h-72 lg:h-auto overflow-hidden">
            <img
              src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pudge.png"
              alt="Pudge"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a] hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent lg:hidden" />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#E84A30] text-white text-xs font-bold px-2 py-0.5 rounded">Самый популярный</span>
              <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded">Поддержка / Инициатор</span>
            </div>
            <h1 className="font-display text-5xl font-bold text-white mb-2 tracking-tight">Pudge</h1>
            <p className="text-gray-300 text-sm italic mb-5">"The Butcher"</p>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-xl">
              Pudge — легендарный герой поддержки с мощным крюком и высоким уроном. Один из самых узнаваемых персонажей Dota 2, обожаемый за зрелищные хуки и возможность определить исход матча одним удачным броском.
            </p>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className={`font-display text-xl font-bold mb-0.5 ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">

          {/* VIDEO GUIDE */}
          <div>
            <h2 className="font-display text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Icon name="Play" size={18} className="text-[#E84A30]" />
              Видеогайд
            </h2>
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden relative aspect-video">
              {videoPlaying ? (
                <iframe
                  src="https://www.youtube.com/embed/yFyamgrBq30?autoplay=1"
                  title="Pudge Guide"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="relative w-full h-full cursor-pointer group" onClick={() => setVideoPlaying(true)}>
                  <img
                    src="https://img.youtube.com/vi/yFyamgrBq30/maxresdefault.jpg"
                    alt="Pudge Guide Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-[#E84A30] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Icon name="Play" size={28} className="text-white translate-x-1" />
                    </div>
                    <div className="text-white font-semibold text-sm">Смотреть гайд на YouTube</div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <a
                      href="https://www.youtube.com/watch?v=yFyamgrBq30"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 bg-black/60 hover:bg-[#E84A30] text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Icon name="ExternalLink" size={12} />
                      YouTube
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ABILITIES */}
          <div>
            <h2 className="font-display text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Icon name="Zap" size={18} className="text-[#E84A30]" />
              Способности
            </h2>
            <div className="space-y-3">
              {abilities.map((ab) => (
                <div key={ab.name} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-[#E84A30] font-display font-bold text-sm">{ab.key}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1a1a1a] mb-1">{ab.name}</div>
                    <div className="text-gray-500 text-sm leading-relaxed mb-2">{ab.desc}</div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="text-gray-400">Урон: <span className="text-[#1a1a1a] font-medium">{ab.dmg}</span></span>
                      <span className="text-gray-400">КД: <span className="text-[#1a1a1a] font-medium">{ab.cd}с</span></span>
                      {ab.mana !== "—" && <span className="text-gray-400">Мана: <span className="text-blue-500 font-medium">{ab.mana}</span></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — items */}
        <div className="space-y-6">
          {/* Attribute bars */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-bold text-[#1a1a1a] mb-4">Характеристики</h3>
            <div className="space-y-3">
              {[
                { label: "Сила", value: 25, max: 40, color: "bg-red-500", icon: "💪" },
                { label: "Ловкость", value: 14, max: 40, color: "bg-green-500", icon: "🏃" },
                { label: "Интеллект", value: 14, max: 40, color: "bg-blue-500", icon: "🧠" },
              ].map((attr) => (
                <div key={attr.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-1">{attr.icon} {attr.label}</span>
                    <span className="text-sm font-bold text-[#1a1a1a]">{attr.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${attr.color} rounded-full`} style={{ width: `${(attr.value / attr.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Урон", value: "52–58" },
                { label: "Броня", value: "3.1" },
                { label: "HP", value: "625" },
                { label: "Скорость", value: "285" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-gray-400">{s.label}</span>
                  <span className="font-semibold text-[#1a1a1a]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Starting items */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-bold text-[#1a1a1a] mb-3">Стартовые предметы</h3>
            <div className="grid grid-cols-4 gap-2">
              {startItems.map((item) => (
                <div key={item.name} className="text-center group cursor-pointer">
                  <div className="w-full aspect-square bg-[#1a1a1a] rounded-lg overflow-hidden mb-1 group-hover:ring-2 ring-[#E84A30] transition-all">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">{item.name}</div>
                  <div className="text-[10px] text-amber-600 font-bold">{item.cost}g</div>
                </div>
              ))}
            </div>
          </div>

          {/* Core items */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-bold text-[#1a1a1a] mb-3">Основные предметы</h3>
            <div className="space-y-2">
              {coreItems.map((item) => (
                <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1a1a1a] truncate">{item.name}</div>
                    <div className="text-xs text-amber-600">{item.cost.toLocaleString()}g</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${roleColors[item.role]}`}>{item.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#1a1a1a] rounded-xl p-5 text-white">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" size={16} className="text-[#E84A30]" />
              Советы
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span className="text-[#E84A30] shrink-0">→</span>Используй Rot перед кастом крюка — замедление поможет попасть</li>
              <li className="flex gap-2"><span className="text-[#E84A30] shrink-0">→</span>Blink + Hook — основная связка для инициации на врага</li>
              <li className="flex gap-2"><span className="text-[#E84A30] shrink-0">→</span>Flesh Heap растёт от убийств — не бойся фармить убийства</li>
              <li className="flex gap-2"><span className="text-[#E84A30] shrink-0">→</span>Dismember даёт урон от силы — качай силу через Heart и Scepter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeroes({ onGo }: { onGo: (s: string) => void }) {
  return (
    <div className="py-10">
      <SectionHeader title="Герои" subtitle="Все герои · Актуальный патч" action="Гайды по героям" onAction={() => onGo("Гайды")} />
      <div className="flex gap-2 mb-5 flex-wrap">
        {["Все", "Керри", "Поддержка", "Маг", "Инициатор"].map((f) => (
          <button key={f} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${f === "Все" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-gray-200 text-gray-600 hover:border-[#E84A30] hover:text-[#E84A30]"}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {HEROES.map((hero) => (
          <div key={hero.name} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
            <div className="relative h-28 overflow-hidden" style={{ backgroundColor: hero.color + "20" }}>
              {HERO_IMAGES[hero.name] ? (
                <img
                  src={HERO_IMAGES[hero.name]}
                  alt={hero.name}
                  className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold text-white" style={{ backgroundColor: hero.color }}>
                    {hero.name[0]}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className={`absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[hero.tier]}`}>{hero.tier}</span>
              {hero.hasVideo && (
                <button onClick={() => onGo("Гайды")} className="absolute top-2 right-2 bg-[#E84A30] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 hover:bg-[#cf3d26] transition-colors">
                  <Icon name="Play" size={9} />Видео
                </button>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="font-semibold text-[#1a1a1a] text-sm truncate">{hero.name}</div>
                {hero.name === "Pudge" && <span className="text-[10px] bg-[#E84A30]/10 text-[#E84A30] px-1 rounded shrink-0">🔥 Топ</span>}
              </div>
              <div className="text-gray-400 text-xs">{hero.role}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Винрейт</span>
                <span className={`text-xs font-bold ${hero.winrate >= 50 ? "text-green-600" : "text-red-500"}`}>{hero.winrate}%</span>
              </div>
              {hero.name === "Pudge" && (
                <button
                  onClick={(e) => { e.stopPropagation(); onGo("Pudge"); }}
                  className="mt-2 w-full text-xs bg-[#1a1a1a] text-white rounded-md py-1 hover:bg-[#E84A30] transition-colors font-medium"
                >
                  Подробнее
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageStats({ onGo }: { onGo: (s: string) => void }) {
  return (
    <div className="py-10">
      <SectionHeader title="Статистика" subtitle="Глобальные данные · Обновление каждые 15 минут" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <Icon name={s.icon} size={20} className="text-[#E84A30] mb-3" />
            <div className="font-display text-3xl font-bold text-[#1a1a1a] mb-1">{s.value}</div>
            <div className="text-gray-500 text-xs mb-2">{s.label}</div>
            <div className="text-xs text-green-600 font-medium">{s.delta}</div>
          </div>
        ))}
      </div>
      <SectionHeader title="Топ героев по пикрейту" subtitle="Текущий патч" action="Все герои" onAction={() => onGo("Герои")} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Герой</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Пикрейт</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Винрейт</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Банрейт</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {POPULAR_HEROES_STATS.map((h, i) => (
              <tr key={h.name} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-5 py-3 flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-5">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: h.color }}>
                    {HERO_IMAGES[h.name] ? (
                      <img src={HERO_IMAGES[h.name]} alt={h.name} className="w-full h-full object-cover object-top scale-125" />
                    ) : (
                      <span className="text-white text-sm font-bold">{h.name[0]}</span>
                    )}
                  </div>
                  <span className="font-semibold text-[#1a1a1a] text-sm">{h.name}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-[#1a1a1a]">{h.pickrate}%</span>
                  <div className="w-20 h-1 bg-gray-100 rounded-full mx-auto mt-1"><div className="h-1 bg-[#E84A30] rounded-full" style={{ width: `${(h.pickrate / 16) * 100}%` }} /></div>
                </td>
                <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${h.winrate >= 50 ? "text-green-600" : "text-red-500"}`}>{h.winrate}%</span></td>
                <td className="px-4 py-3 text-center"><span className="text-sm text-gray-500">{h.banrate}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageItems() {
  const [filter, setFilter] = useState("Все");
  const [selected, setSelected] = useState<typeof ITEMS[0] | null>(null);
  const [tangoPlaying, setTangoPlaying] = useState(false);
  const tangoAudioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = filter === "Все" ? ITEMS : ITEMS.filter(i => i.type === filter);

  const playTango = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tangoPlaying) {
      tangoAudioRef.current?.pause();
      if (tangoAudioRef.current) tangoAudioRef.current.currentTime = 0;
      setTangoPlaying(false);
      return;
    }
    const audio = new Audio("https://www.myinstants.com/media/sounds/12-tango.mp3");
    tangoAudioRef.current = audio;
    audio.play().catch(() => {});
    setTangoPlaying(true);
    audio.onended = () => setTangoPlaying(false);
  };

  const CATEGORIES = [
    { label: "Все", icon: "LayoutGrid" },
    { label: "Оружие", icon: "Sword" },
    { label: "Броня", icon: "Shield" },
    { label: "Артефакт", icon: "Zap" },
    { label: "Аксессуар", icon: "Gem" },
    { label: "Мем", icon: "PartyPopper" },
  ];

  return (
    <div className="py-10">
      <SectionHeader title="Предметы" subtitle={`Dota 2 · Актуальный патч · ${filtered.length} предметов`} />

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((f) => (
          <button
            key={f.label}
            onClick={() => { setFilter(f.label); setSelected(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
              filter === f.label
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "border-gray-200 text-gray-600 hover:border-[#E84A30] hover:text-[#E84A30]"
            }`}
          >
            <Icon name={f.icon} size={13} />
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Список предметов */}
        <div className={`${selected ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const isTango = (item as typeof item & { meme?: boolean }).meme;
              return (
                <div
                  key={item.name}
                  onClick={isTango ? playTango : () => setSelected(selected?.name === item.name ? null : item)}
                  className={`bg-white rounded-xl border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group ${
                    isTango
                      ? tangoPlaying
                        ? "border-green-400 shadow-green-200 shadow-lg scale-105"
                        : "border-green-200 hover:border-green-400"
                      : selected?.name === item.name
                        ? "border-[#E84A30] shadow-md"
                        : "border-gray-100"
                  }`}
                >
                  <div className="relative h-24 flex items-center justify-center overflow-hidden" style={{ backgroundColor: item.color + "18" }}>
                    <img
                      src={item.img}
                      alt={item.name}
                      className={`h-16 w-auto object-contain drop-shadow-lg transition-transform duration-300 ${isTango && tangoPlaying ? "animate-bounce" : "group-hover:scale-110"}`}
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    />
                    <span className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded ${isTango ? "bg-green-100 text-green-700" : item.winrate >= 55 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isTango ? "🕺 МЕМ" : `WR ${item.winrate}%`}
                    </span>
                    <span className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded ${isTango ? "bg-green-600 text-white" : "bg-black/40 text-white"}`}>{item.type}</span>
                    {isTango && tangoPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/10">
                        <span className="text-2xl animate-ping">🕺</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-[#1a1a1a] text-sm leading-snug mb-1">{item.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {isTango ? (
                          <span className="text-sm font-bold text-green-600">{tangoPlaying ? "Играет... 🎵" : "Нажми и танцуй!"}</span>
                        ) : (
                          <>
                            <Icon name="Coins" size={12} className="text-amber-500" />
                            <span className="text-sm font-bold text-[#1a1a1a]">{item.cost > 0 ? item.cost.toLocaleString() : "Рошан"}</span>
                          </>
                        )}
                      </div>
                      {!isTango && <Icon name="ChevronRight" size={14} className={`transition-transform ${selected?.name === item.name ? "rotate-90 text-[#E84A30]" : "text-gray-300"}`} />}
                      {isTango && <Icon name="Music" size={14} className={tangoPlaying ? "text-green-500 animate-pulse" : "text-green-300"} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Детальная карточка */}
        {selected && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-20 shadow-lg">
              {/* Header */}
              <div className="relative h-40 flex items-center justify-center" style={{ backgroundColor: selected.color + "20" }}>
                <img
                  src={selected.img}
                  alt={selected.name}
                  className="h-24 w-auto object-contain drop-shadow-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 transition-colors">
                  <Icon name="X" size={14} />
                </button>
                <span className="absolute bottom-3 left-3 text-xs bg-black/40 text-white px-2 py-0.5 rounded">{selected.type}</span>
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-1">{selected.name}</h3>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Icon name="Coins" size={14} className="text-amber-500" />
                    </div>
                    <div className="font-display text-lg font-bold text-[#1a1a1a]">
                      {selected.cost > 0 ? selected.cost.toLocaleString() : "—"}
                    </div>
                    <div className="text-xs text-gray-400">{selected.cost > 0 ? "золота" : "с Рошана"}</div>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${selected.winrate >= 55 ? "bg-green-50" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Icon name="TrendingUp" size={14} className={selected.winrate >= 55 ? "text-green-500" : "text-gray-400"} />
                    </div>
                    <div className={`font-display text-lg font-bold ${selected.winrate >= 55 ? "text-green-600" : "text-gray-600"}`}>
                      {selected.winrate}%
                    </div>
                    <div className="text-xs text-gray-400">винрейт</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Описание</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{selected.desc}</p>
                </div>

                {/* Category badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">{selected.type}</span>
                  {selected.winrate >= 55 && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">Высокий WR</span>
                  )}
                  {selected.cost === 0 && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700">Рошан</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageMatches() {
  return (
    <div className="py-10">
      <SectionHeader title="Матчи" subtitle="Последние профессиональные матчи" />
      <div className="space-y-3">
        {MATCHES.map((match) => (
          <div key={match.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-xs text-gray-400 font-mono w-20 shrink-0">{match.id}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#1a1a1a] text-sm">{match.team1}</span>
                  <span className="font-display text-lg font-bold text-[#1a1a1a] bg-gray-100 px-3 py-0.5 rounded-lg">{match.score}</span>
                  <span className="font-semibold text-[#1a1a1a] text-sm">{match.team2}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{match.map}</span>
                <div>
                  <div className="text-xs text-gray-500">{match.duration}</div>
                  <div className="text-xs text-gray-400">{match.when}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PagePlayers() {
  return (
    <div className="py-10">
      <SectionHeader title="Игроки" subtitle="Профессиональные игроки Dota 2" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLAYERS.map((player) => (
          <div key={player.name} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center relative">
                <span className="text-lg font-bold text-gray-600">{player.name[0]}</span>
                <span className="absolute -bottom-1 -right-1 text-sm">{player.country}</span>
              </div>
              <div>
                <div className="font-bold text-[#1a1a1a]">{player.name}</div>
                <div className="text-sm text-gray-400">{player.team}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-display text-xl font-bold text-[#1a1a1a]">{player.mmr.toLocaleString()}</div>
                <div className="text-xs text-gray-400">MMR</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                name={player.trend === "up" ? "TrendingUp" : player.trend === "down" ? "TrendingDown" : "Minus"}
                size={14}
                className={player.trend === "up" ? "text-green-500" : player.trend === "down" ? "text-red-500" : "text-gray-400"}
              />
              <span className={`text-xs font-medium ${player.trend === "up" ? "text-green-500" : player.trend === "down" ? "text-red-500" : "text-gray-400"}`}>
                {player.trend === "up" ? "Растёт" : player.trend === "down" ? "Падает" : "Стабильно"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageTournaments() {
  return (
    <div className="py-10">
      <SectionHeader title="Турниры" subtitle="Текущие, предстоящие и завершённые события" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOURNAMENTS.map((t) => (
          <div key={t.name} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <Icon name="Trophy" size={20} className="text-[#E84A30]" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === "live" ? "bg-green-100 text-green-700" : t.status === "soon" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                {t.status === "live" ? "🔴 Live" : t.status === "soon" ? "Скоро" : "Завершён"}
              </span>
            </div>
            <h3 className="font-semibold text-[#1a1a1a] mb-1 text-sm leading-snug">{t.name}</h3>
            <div className="text-xs text-gray-400 mb-3">{t.date} · {t.location}</div>
            <div className="font-display text-lg font-bold text-[#E84A30] mb-3">{t.prize}</div>
            <div className="flex items-center gap-1 text-gray-400">
              <Icon name="Users" size={12} />
              <span className="text-xs">{t.teams} команд</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageRatings({ onGo }: { onGo: (s: string) => void }) {
  return (
    <div className="py-10">
      <SectionHeader title="Рейтинги" subtitle="Топ-10 игроков мира по MMR" action="Все игроки" onAction={() => onGo("Игроки")} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Игрок</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">MMR</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Побед</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Поражений</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Винрейт</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {RATINGS.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-5 py-3">
                  <span className={`text-sm font-bold ${p.rank <= 3 ? "text-[#E84A30]" : "text-gray-400"}`}>{p.rank}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.country}</span>
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-gray-600">{p.name[0]}</span></div>
                    <div>
                      <div className="font-semibold text-[#1a1a1a] text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.team}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center"><span className="font-display text-sm font-bold text-[#1a1a1a]">{p.mmr.toLocaleString()}</span></td>
                <td className="px-4 py-3 text-center hidden sm:table-cell"><span className="text-sm text-green-600">{p.wins.toLocaleString()}</span></td>
                <td className="px-4 py-3 text-center hidden sm:table-cell"><span className="text-sm text-red-500">{p.losses.toLocaleString()}</span></td>
                <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${p.winrate >= 55 ? "text-green-600" : "text-gray-600"}`}>{p.winrate}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: typeof GUIDES[0] }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col">
      {/* Thumbnail / Player */}
      <div className="relative aspect-video bg-[#1a1a1a] overflow-hidden">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${guide.videoId}?autoplay=1`}
            title={guide.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="relative w-full h-full cursor-pointer" onClick={() => setPlaying(true)}>
            <img
              src={`https://img.youtube.com/vi/${guide.videoId}/maxresdefault.jpg`}
              alt={guide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${guide.videoId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-[#E84A30] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                <Icon name="Play" size={24} className="text-white translate-x-0.5" />
              </div>
            </div>
            {/* Badges */}
            <span className="absolute top-3 left-3 bg-[#E84A30] text-white text-xs font-medium px-2 py-0.5 rounded">{guide.tier}</span>
            <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded">{guide.hero}</span>
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-mono">{guide.duration}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[#1a1a1a] mb-3 leading-snug flex-1">{guide.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E84A30] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{guide.author[0]}</span>
            </div>
            <span className="text-sm text-gray-600 font-medium">{guide.author}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-400">
              <Icon name="Eye" size={12} />
              <span className="text-xs">{guide.views}</span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${guide.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#E84A30] transition-colors"
            >
              <Icon name="ExternalLink" size={12} />
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageGuides() {
  return (
    <div className="py-10">
      <SectionHeader title="Видеогайды от профи" subtitle="Реальные гайды от лучших игроков мира" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GUIDES.map((guide) => (
          <GuideCard key={guide.videoId} guide={guide} />
        ))}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-2xl transition-transform ${onChange ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <span className={(hovered || value) >= s ? "text-amber-400" : "text-gray-200"}>★</span>
        </button>
      ))}
    </div>
  );
}

function PageReviews({ user, onLogin }: { user: ReturnType<typeof useAuth>["user"]; onLogin: () => void }) {
  const [reviews, setReviews] = useState<Array<{id: number; rating: number; text: string; created_at: string; user_name: string; user_avatar: string; provider: string}>>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | boolean>(false);
  const [userHasReview, setUserHasReview] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(REVIEWS_URL);
      const data = await res.json();
      setReviews(data.reviews || []);
      if (user) {
        setUserHasReview(data.reviews?.some((r: {user_name: string}) => r.user_name === user.name) || false);
      }
    } catch { /* ignore */ }
    setLoadingReviews(false);
  }, [user]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Поставьте оценку"); return; }
    if (text.trim().length < 5) { setError("Напишите отзыв (минимум 5 символов)"); return; }
    setError("");
    setSubmitting(true);
    const token = localStorage.getItem("dl_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["X-Session-Token"] = token;
    const res = await fetch(REVIEWS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ rating, text: text.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Ошибка"); setSubmitting(false); return; }
    setSuccess(data.guest_name || true);
    setRating(0);
    setText("");
    if (user) setUserHasReview(true);
    loadReviews();
    setSubmitting(false);
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1a1a1a] tracking-tight">Отзывы</h2>
          <p className="text-gray-500 text-sm mt-0.5">Что говорят игроки о DotaLife</p>
        </div>
        {reviews.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-[#1a1a1a]">{avgRating}</span>
            <div>
              <StarRating value={Math.round(Number(avgRating))} />
              <p className="text-xs text-gray-400 mt-0.5">{reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
            <h3 className="font-display font-bold text-[#1a1a1a] mb-4">Оставить отзыв</h3>
            {userHasReview ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
                <p className="text-gray-500 text-sm">Вы уже оставили отзыв. Спасибо!</p>
              </div>
            ) : success ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
                <p className="font-semibold text-[#1a1a1a] mb-1">Отзыв опубликован!</p>
                {typeof success === "string" && (
                  <p className="text-gray-400 text-sm">Ваше имя: <span className="font-medium text-[#1a1a1a]">{success}</span></p>
                )}
                <p className="text-gray-400 text-sm mt-1">Спасибо за обратную связь!</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {/* Аватар пользователя или гость */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {user ? (
                    <>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-[#E84A30] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-[#1a1a1a]">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.provider === "google" ? "Google" : "ВКонтакте"}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#1a1a1a]">#Гость#####</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          Номер присвоится автоматически ·
                          <button type="button" onClick={onLogin} className="text-[#E84A30] hover:underline">Войти</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Оценка</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Ваш отзыв</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Расскажите о своём опыте использования DotaLife..."
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#E84A30] resize-none transition-colors"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{text.length}/1000</div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#E84A30] text-white font-medium py-2.5 rounded-lg hover:bg-[#cf3d26] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Отправка..." : "Опубликовать"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews list */}
        <div className="lg:col-span-2 space-y-4">
          {loadingReviews ? (
            Array.from({length: 3}).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Icon name="MessageSquare" size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Пока нет отзывов. Будьте первым!</p>
            </div>
          ) : reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {review.user_avatar ? (
                    <img src={review.user_avatar} alt={review.user_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : review.provider === "guest" ? (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon name="User" size={18} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-[#E84A30] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{review.user_name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <div>
                      <span className="font-semibold text-[#1a1a1a] text-sm">{review.user_name}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        {review.provider === "google" ? "Google" : review.provider === "vk" ? "ВКонтакте" : "Гость"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <StarRating value={review.rating} />
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeSection({ onGo }: { onGo: (s: string) => void }) {
  return (
    <>
      {/* HERO */}
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
                <button onClick={() => onGo("Гайды")} className="bg-[#E84A30] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#cf3d26] transition-colors">
                  Смотреть гайды
                </button>
                <button onClick={() => onGo("Матчи")} className="border border-gray-600 text-gray-300 font-medium px-6 py-3 rounded-lg hover:border-gray-400 hover:text-white transition-colors">
                  Найти матч
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "124", label: "Героя", icon: "Sword", section: "Герои" },
                { value: "2.4M", label: "Матчей сегодня", icon: "Swords", section: "Матчи" },
                { value: "48K", label: "Видеогайдов", icon: "Play", section: "Гайды" },
              ].map((stat) => (
                <button key={stat.label} onClick={() => onGo(stat.section)} className="bg-white/5 rounded-xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <Icon name={stat.icon} size={22} className="text-[#E84A30] mx-auto mb-2" />
                  <div className="font-display text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* HEROES preview */}
        <section className="mb-14">
          <SectionHeader title="Герои" subtitle="Актуальный патч · Топ по винрейту" action="Все герои" onAction={() => onGo("Герои")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {HEROES.slice(0, 6).map((hero) => (
              <div key={hero.name} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group" onClick={() => onGo("Герои")}>
                <div className="relative h-28 overflow-hidden" style={{ backgroundColor: hero.color + "20" }}>
                  {HERO_IMAGES[hero.name] ? (
                    <img src={HERO_IMAGES[hero.name]} alt={hero.name} className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold text-white" style={{ backgroundColor: hero.color }}>{hero.name[0]}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[hero.tier]}`}>{hero.tier}</span>
                  {hero.hasVideo && (
                    <span className="absolute top-2 right-2 bg-[#E84A30] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Icon name="Play" size={9} />Видео
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-[#1a1a1a] text-sm truncate">{hero.name}</div>
                  <div className="text-gray-400 text-xs">{hero.role}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Винрейт</span>
                    <span className={`text-xs font-bold ${hero.winrate >= 50 ? "text-green-600" : "text-red-500"}`}>{hero.winrate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MATCHES + PLAYERS */}
        <div className="grid lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-2">
            <SectionHeader title="Матчи" subtitle="Последние результаты" action="Все матчи" onAction={() => onGo("Матчи")} />
            <div className="space-y-3">
              {MATCHES.slice(0, 3).map((match) => (
                <div key={match.id} onClick={() => onGo("Матчи")} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow cursor-pointer">
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
            <SectionHeader title="Рейтинг" subtitle="Топ игроки мира" action="Все" onAction={() => onGo("Рейтинги")} />
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {PLAYERS.slice(0, 5).map((player) => (
                <div key={player.name} onClick={() => onGo("Игроки")} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className={`w-6 text-center text-sm font-bold ${player.rank === 1 ? "text-[#E84A30]" : "text-gray-400"}`}>{player.rank}</span>
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

        {/* GUIDES preview */}
        <section className="mb-14">
          <SectionHeader title="Видеогайды от профи" subtitle="Обучайся у лучших игроков мира" action="Все гайды" onAction={() => onGo("Гайды")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDES.slice(0, 3).map((guide) => (
              <div key={guide.videoId} onClick={() => onGo("Гайды")} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={`https://img.youtube.com/vi/${guide.videoId}/maxresdefault.jpg`}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${guide.videoId}/hqdefault.jpg`; }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#E84A30] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon name="Play" size={20} className="text-white translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 bg-[#E84A30] text-white text-xs font-medium px-2 py-0.5 rounded">{guide.tier}</span>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-mono">{guide.duration}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1a1a1a] mb-2 leading-snug">{guide.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#E84A30] rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{guide.author[0]}</span></div>
                      <span className="text-sm text-gray-600 font-medium">{guide.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400"><Icon name="Eye" size={12} /><span className="text-xs">{guide.views}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TOURNAMENTS */}
        <section className="mb-10">
          <SectionHeader title="Турниры" subtitle="Текущие и предстоящие события" action="Все турниры" onAction={() => onGo("Турниры")} />
          <div className="grid sm:grid-cols-3 gap-4">
            {TOURNAMENTS.slice(0, 3).map((t) => (
              <div key={t.name} onClick={() => onGo("Турниры")} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <Icon name="Trophy" size={20} className="text-[#E84A30]" />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === "live" ? "bg-green-100 text-green-700" : t.status === "soon" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
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
    </>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("Главная");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout } = useAuth();

  const navigate = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Герои": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageHeroes onGo={navigate} /></div>;
      case "Статистика": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageStats onGo={navigate} /></div>;
      case "Предметы": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageItems /></div>;
      case "Матчи": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageMatches /></div>;
      case "Игроки": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PagePlayers /></div>;
      case "Турниры": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageTournaments /></div>;
      case "Рейтинги": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageRatings onGo={navigate} /></div>;
      case "Гайды": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageGuides /></div>;
      case "Pudge": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PagePudge onGo={navigate} /></div>;
      case "Отзывы": return <div className="max-w-7xl mx-auto px-4 sm:px-6"><PageReviews user={user} onLogin={() => setShowLogin(true)} /></div>;
      default: return <HomeSection onGo={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-body">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <NavHeader
        activeSection={activeSection}
        setActiveSection={navigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={logout}
      />

      {renderSection()}

      <footer className="bg-[#1a1a1a] text-gray-400 py-10 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button className="flex items-center gap-3" onClick={() => navigate("Главная")}>
              <div className="w-7 h-7 bg-[#E84A30] rounded-sm flex items-center justify-center">
                <span className="text-white font-display text-xs font-bold">DL</span>
              </div>
              <span className="font-display text-white font-bold">DotaLife</span>
            </button>
            <div className="flex gap-6 text-sm flex-wrap justify-center">
              {["Герои", "Матчи", "Турниры", "Гайды"].map((item) => (
                <button key={item} onClick={() => navigate(item)} className="hover:text-white transition-colors">{item}</button>
              ))}
            </div>
            <div className="text-xs text-gray-600">© 2026 DotaLife. Все права защищены.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}