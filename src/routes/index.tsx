import { createFileRoute } from "@tanstack/react-router";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import {
  Search, Bell, Home, Zap, PlaySquare, Library, ArrowLeft, MoreVertical,
  ThumbsUp, ThumbsDown, Share2, Bookmark, Download, ChevronDown, Plus, X,
  TrendingUp, ChevronRight, Check, BarChart3, ArrowUpRight, Play, Pause,
  Heart, MessageCircle, Maximize2, RotateCcw, AlertCircle, Inbox,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YouTube Sparks — Mid-form for Bharat" },
      { name: "description", content: "PM case study prototype: a 3–8 min video format for Tier 2/3 Gen Z India." },
    ],
  }),
  component: Index,
});

/* ============================================================
 *  CONSTANTS + DATA
 * ============================================================ */
const RED = "#FF0000";
const PURPLE = "#7C3AED";
const LIGHT_PURPLE = "#EDE9FE";

type Lang = "Hindi" | "Tamil" | "Telugu";
type Spark = {
  id: number; title: string; creator: string; avatar: string;
  durationSec: number; views: string; lang: Lang; flag: string;
  hue: string; tags: string[]; subs: string; youtubeId: string;
};

const SPARKS: Spark[] = [
  { id: 1, title: "IPL 2026 — Kohli's Last Season Explained", creator: "CricketWithRohit", avatar: "from-blue-500 to-indigo-600", durationSec: 300, views: "2.1M views", lang: "Hindi", flag: "🇮🇳", hue: "from-purple-600 via-fuchsia-500 to-pink-500", tags: ["Trending"], subs: "1.2M", youtubeId: "dQw4w9WgXcQ" },
  { id: 2, title: "Budget Cooking: Rajma in 5 Min", creator: "DesiKitchen", avatar: "from-amber-500 to-red-500", durationSec: 320, views: "890K views", lang: "Hindi", flag: "🇮🇳", hue: "from-orange-500 via-rose-500 to-purple-600", tags: [], subs: "640K", youtubeId: "9bZkp7q19f0" },
  { id: 3, title: "UPSC Strategy for Working Students", creator: "StudyWithArjun", avatar: "from-emerald-500 to-teal-600", durationSec: 420, views: "1.4M views", lang: "Hindi", flag: "🇮🇳", hue: "from-indigo-600 via-purple-600 to-violet-500", tags: ["Trending"], subs: "820K", youtubeId: "tgbNymZ7vqY" },
  { id: 4, title: "Chennai Auto Hacks எல்லாரும் தெரிஞ்சுக்கணும்", creator: "MaduraiVlogs", avatar: "from-rose-500 to-purple-600", durationSec: 360, views: "510K views", lang: "Tamil", flag: "🇮🇳", hue: "from-sky-500 via-blue-600 to-indigo-700", tags: [], subs: "310K", youtubeId: "aircAruvnKk" },
  { id: 5, title: "Hyderabad Biryani Tour — చిన్న షాపులు", creator: "TeluguFoodie", avatar: "from-teal-500 to-cyan-600", durationSec: 380, views: "720K views", lang: "Telugu", flag: "🇮🇳", hue: "from-yellow-500 via-orange-500 to-red-500", tags: ["Trending"], subs: "450K", youtubeId: "kCc8FmEb1nY" },
];

const CHAPTERS: { label: string; sec: number }[] = [
  { label: "Intro", sec: 0 },
  { label: "Stats Deep Dive", sec: 90 },
  { label: "Final Take", sec: 240 },
];

const COMMENTS_BY_LANG: Record<Lang, { id: string; user: string; text: string; likes: number }[]> = {
  Hindi: [
    { id: "h1", user: "@rahul_24", text: "बहुत ज़बरदस्त वीडियो भाई! Kohli की analysis एकदम सही 🔥", likes: 234 },
    { id: "h2", user: "@priya.singh", text: "इतना कम time में इतनी अच्छी जानकारी, मज़ा आ गया", likes: 156 },
    { id: "h3", user: "@cricket_lover", text: "Spark format mast hai, full video dekhne ka mann kar raha", likes: 98 },
    { id: "h4", user: "@uttam_bhopal", text: "Tier 2 viewer से ❤️ — ये format perfect है", likes: 67 },
    { id: "h5", user: "@desi_genz", text: "5 min me sab clear ho gaya, thanks!", likes: 42 },
  ],
  Tamil: [
    { id: "t1", user: "@arun_chennai", text: "இது அருமையான வீடியோ! நன்றி அண்ணா 🙏", likes: 187 },
    { id: "t2", user: "@kavya.m", text: "5 நிமிஷத்துல full content கிடைச்சது super!", likes: 123 },
    { id: "t3", user: "@madurai_boy", text: "Sparks format romba useful da", likes: 89 },
    { id: "t4", user: "@tn_viewer", text: "More Tamil sparks please 🔥", likes: 54 },
    { id: "t5", user: "@auto_anna", text: "Real-ah useful info, vera level", likes: 31 },
  ],
  Telugu: [
    { id: "te1", user: "@srinivas_hyd", text: "Chala bagundi anna! Biryani tour next part eppudu? 🍛", likes: 201 },
    { id: "te2", user: "@lakshmi.t", text: "Sparks format chala convenient ga undi", likes: 142 },
    { id: "te3", user: "@vizag_foodie", text: "Mee content quality top notch", likes: 76 },
    { id: "te4", user: "@telugu_genz", text: "5 mins lo entha info ichaaru, thanks!", likes: 49 },
    { id: "te5", user: "@warangal_w", text: "Full video link kavali please", likes: 28 },
  ],
};

const SHORTS_DATA = [
  { id: "jNQXAC9IVRw", title: "Me at the zoo", creator: "@jawed", hue: "from-pink-600 via-rose-500 to-orange-400", likes: 1234 },
  { id: "tgbNymZ7vqY", title: "Habits in 60 sec", creator: "@improvementpill", hue: "from-blue-600 via-indigo-500 to-purple-600", likes: 892 },
  { id: "kCc8FmEb1nY", title: "GPT in 60 sec", creator: "@karpathy", hue: "from-yellow-500 via-orange-500 to-red-600", likes: 2104 },
  { id: "hY7m5jjJ9mM", title: "Rajma Chawal quick", creator: "@kabitaskitchen", hue: "from-emerald-500 via-teal-600 to-cyan-700", likes: 567 },
];

const FILTERS = ["For You", "Trending", "Hindi", "Tamil", "Telugu", "Following"];

const ANALYTICS_RANGES = {
  "Last 7 days": { views: 3200, completion: 58, earned: 240, bars: { Hindi: 62, Tamil: 55, Telugu: 59 } },
  "Last 28 days": { views: 12400, completion: 63, earned: 980, bars: { Hindi: 65, Tamil: 58, Telugu: 61 } },
  "Last 90 days": { views: 41000, completion: 61, earned: 3200, bars: { Hindi: 64, Tamil: 57, Telugu: 60 } },
  "Lifetime": { views: 89000, completion: 60, earned: 7100, bars: { Hindi: 63, Tamil: 56, Telugu: 59 } },
};
type RangeKey = keyof typeof ANALYTICS_RANGES;

/* ============================================================
 *  APP STATE CONTEXT
 * ============================================================ */
type Screen =
  | { name: "feed" }
  | { name: "search" }
  | { name: "player"; videoId: number; autoEnd?: boolean }
  | { name: "shorts" }
  | { name: "create"; publishedTo?: number }
  | { name: "analytics"; banner?: string }
  | { name: "creator"; creator: string }
  | { name: "library" };

type Toast = { id: number; text: string };
type Sheet = { title?: string; items: { label: string; onClick: () => void; danger?: boolean }[] } | null;
type Dialog = { title: string; confirmLabel: string; cancelLabel?: string; danger?: boolean; onConfirm: () => void } | null;

type AppState = {
  screen: Screen;
  navigate: (s: Screen) => void;
  back: () => void;

  liked: Set<number>; toggleLike: (id: number) => void;
  disliked: Set<number>; toggleDislike: (id: number) => void;
  saved: Set<number>; toggleSave: (id: number, silent?: boolean) => void;
  subs: Set<string>; toggleSub: (creator: string) => boolean; // returns new state
  hiddenFeed: Set<number>; hide: (id: number) => void;
  selectedFilter: string; setSelectedFilter: (f: string) => void;

  comments: Record<number, { id: string; user: string; text: string; likes: number; likedByMe?: boolean; replies?: { id: string; user: string; text: string }[] }[]>;
  postComment: (videoId: number, text: string) => void;
  postReply: (videoId: number, commentId: string, text: string) => void;
  toggleCommentLike: (videoId: number, commentId: string) => void;

  shortsLikes: Record<string, { liked: boolean; count: number }>;
  toggleShortLike: (id: string) => void;
  shortsComments: Record<string, { id: string; user: string; text: string }[]>;
  postShortComment: (id: string, text: string) => void;

  toasts: Toast[]; toast: (text: string) => void;
  sheet: Sheet; openSheet: (s: Sheet) => void;
  dialog: Dialog; openDialog: (d: Dialog) => void;
};
const Ctx = createContext<AppState | null>(null);
const useApp = () => useContext(Ctx)!;

function AppProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<Screen[]>([{ name: "feed" }]);
  const screen = history[history.length - 1];

  const navigate = useCallback((s: Screen) => setHistory((h) => [...h, s]), []);
  const back = useCallback(() => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)), []);

  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [disliked, setDisliked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [hiddenFeed, setHidden] = useState<Set<number>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState("For You");

  const [comments, setComments] = useState<AppState["comments"]>(() => {
    const out: AppState["comments"] = {};
    for (const s of SPARKS) {
      out[s.id] = COMMENTS_BY_LANG[s.lang].map((c) => ({ ...c, likedByMe: false, replies: [] }));
    }
    return out;
  });

  const [shortsLikes, setShortsLikes] = useState<Record<string, { liked: boolean; count: number }>>(
    () => Object.fromEntries(SHORTS_DATA.map((s) => [s.id, { liked: false, count: s.likes }])),
  );
  const [shortsComments, setShortsComments] = useState<Record<string, { id: string; user: string; text: string }[]>>(
    () => Object.fromEntries(SHORTS_DATA.map((s) => [s.id, [
      { id: "c1", user: "@viewer1", text: "Loved this 🔥" },
      { id: "c2", user: "@viewer2", text: "So relatable haha" },
      { id: "c3", user: "@viewer3", text: "More please!" },
      { id: "c4", user: "@viewer4", text: "Underrated creator" },
    ]])),
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(1);
  const toast = useCallback((text: string) => {
    const id = toastIdRef.current++;
    setToasts((t) => [...t.slice(-0), { id, text }]); // replace queue: only 1 visible
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  const [sheet, openSheet] = useState<Sheet>(null);
  const [dialog, openDialog] = useState<Dialog>(null);

  const toggleLike = (id: number) => {
    setLiked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setDisliked((s) => { if (!s.has(id)) return s; const n = new Set(s); n.delete(id); return n; });
  };
  const toggleDislike = (id: number) => {
    setDisliked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setLiked((s) => { if (!s.has(id)) return s; const n = new Set(s); n.delete(id); return n; });
  };
  const toggleSave = (id: number, silent?: boolean) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); if (!silent) toast("Removed from Watch Later"); }
      else { n.add(id); if (!silent) toast("Saved to Watch Later ✓"); }
      return n;
    });
  };
  const toggleSub = (creator: string) => {
    let newState = false;
    setSubs((s) => {
      const n = new Set(s);
      if (n.has(creator)) n.delete(creator);
      else { n.add(creator); newState = true; }
      return n;
    });
    return newState;
  };
  const hide = (id: number) => setHidden((s) => new Set(s).add(id));

  const postComment = (videoId: number, text: string) => {
    if (!text.trim()) return;
    setComments((c) => ({
      ...c,
      [videoId]: [{ id: `me-${Date.now()}`, user: "You", text, likes: 0, likedByMe: false, replies: [] }, ...(c[videoId] || [])],
    }));
  };
  const postReply = (videoId: number, commentId: string, text: string) => {
    if (!text.trim()) return;
    setComments((c) => ({
      ...c,
      [videoId]: (c[videoId] || []).map((com) =>
        com.id === commentId ? { ...com, replies: [...(com.replies || []), { id: `r-${Date.now()}`, user: "You", text }] } : com,
      ),
    }));
  };
  const toggleCommentLike = (videoId: number, commentId: string) => {
    setComments((c) => ({
      ...c,
      [videoId]: (c[videoId] || []).map((com) =>
        com.id === commentId ? { ...com, likedByMe: !com.likedByMe, likes: com.likes + (com.likedByMe ? -1 : 1) } : com,
      ),
    }));
  };

  const toggleShortLike = (id: string) =>
    setShortsLikes((s) => ({ ...s, [id]: { liked: !s[id].liked, count: s[id].count + (s[id].liked ? -1 : 1) } }));
  const postShortComment = (id: string, text: string) => {
    if (!text.trim()) return;
    setShortsComments((s) => ({ ...s, [id]: [{ id: `me-${Date.now()}`, user: "You", text }, ...(s[id] || [])] }));
  };

  const value: AppState = {
    screen, navigate, back,
    liked, toggleLike, disliked, toggleDislike, saved, toggleSave, subs, toggleSub,
    hiddenFeed, hide, selectedFilter, setSelectedFilter,
    comments, postComment, postReply, toggleCommentLike,
    shortsLikes, toggleShortLike, shortsComments, postShortComment,
    toasts, toast, sheet, openSheet, dialog, openDialog,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ============================================================
 *  ROOT
 * ============================================================ */
function Index() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { screen, navigate } = useApp();
  return (
    <div className="min-h-screen w-full bg-neutral-100 flex justify-center font-sans" style={{ fontFamily: "Inter, Roboto, system-ui, sans-serif" }}>
      <div className="w-full max-w-[390px] bg-white h-screen relative shadow-xl overflow-hidden">
        <div className="absolute inset-0 bottom-[64px] overflow-y-auto">
          {screen.name === "feed" && <FeedScreen />}
          {screen.name === "search" && <SearchScreen />}
          {screen.name === "player" && <PlayerScreen videoId={screen.videoId} autoEnd={screen.autoEnd} />}
          {screen.name === "shorts" && <ShortsScreen />}
          {screen.name === "create" && <CreateScreen />}
          {screen.name === "analytics" && <AnalyticsScreen banner={screen.banner} />}
          {screen.name === "creator" && <CreatorScreen creator={screen.creator} />}
          {screen.name === "library" && <LibraryScreen />}
        </div>
        <BottomNav />
        {screen.name === "feed" && (
          <button
            onClick={() => navigate({ name: "create" })}
            className="absolute right-4 bottom-[80px] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${RED})` }}
            aria-label="Create a Spark"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}
        <ToastContainer />
        <SheetContainer />
        <DialogContainer />
      </div>
    </div>
  );
}

/* ============================================================
 *  GLOBAL UI: Toast / Sheet / Dialog
 * ============================================================ */
function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="absolute left-0 right-0 bottom-20 flex flex-col items-center pointer-events-none z-[60]">
      {toasts.map((t) => (
        <div key={t.id} className="px-4 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-medium shadow-lg mx-4 animate-[slideUp_.2s_ease-out]" style={{ animation: "slideUp .25s ease-out" }}>
          {t.text}
        </div>
      ))}
      <style>{`@keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );
}

function SheetContainer() {
  const { sheet, openSheet } = useApp();
  if (!sheet) return null;
  return (
    <div className="absolute inset-0 z-[70] flex items-end" onClick={() => openSheet(null)}>
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_.2s]" />
      <div className="relative w-full bg-white rounded-t-2xl pb-4 animate-[slideUpSheet_.25s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mt-2 mb-2 h-1 w-10 rounded-full bg-neutral-300" />
        {sheet.title && <div className="px-4 py-2 text-sm font-semibold text-neutral-700">{sheet.title}</div>}
        <div className="divide-y divide-neutral-100">
          {sheet.items.map((it, i) => (
            <button key={i} onClick={() => { openSheet(null); it.onClick(); }} className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-50" style={{ color: it.danger ? RED : "#111" }}>
              {it.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideUpSheet { from { transform: translateY(100%) } to { transform: translateY(0) } } @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </div>
  );
}

function DialogContainer() {
  const { dialog, openDialog } = useApp();
  if (!dialog) return null;
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center px-6" onClick={() => openDialog(null)}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full bg-white rounded-2xl p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-base font-semibold text-neutral-900">{dialog.title}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => openDialog(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100">
            {dialog.cancelLabel || "Cancel"}
          </button>
          <button
            onClick={() => { const fn = dialog.onConfirm; openDialog(null); fn(); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: dialog.danger ? RED : PURPLE }}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 *  TopBar + BottomNav
 * ============================================================ */
function TopBar() {
  const { navigate, openSheet, openDialog, toast } = useApp();
  const openProfile = () => {
    openSheet({
      title: undefined,
      items: [
        { label: "👤 Utsav Kumar Lakshya — View Channel", onClick: () => toast("Channel coming soon ✨") },
        { label: "Manage Account", onClick: () => toast("Manage Account coming soon ✨") },
        { label: "Switch Account", onClick: () => toast("Switch Account coming soon ✨") },
        { label: "YouTube Studio", onClick: () => toast("YouTube Studio coming soon ✨") },
        { label: "Settings", onClick: () => toast("Settings coming soon ✨") },
        { label: "Help & Feedback", onClick: () => toast("Help coming soon ✨") },
        { label: "Sign Out", danger: true, onClick: () =>
          openDialog({ title: "Sign out?", confirmLabel: "Sign Out", danger: true, onConfirm: () => window.location.reload() }) },
      ],
    });
  };
  return (
    <div className="h-14 flex items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-neutral-100">
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: RED }}>
          <PlaySquare className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="font-bold tracking-tight text-neutral-900">YouTube</span>
        <span className="text-[10px] font-semibold ml-1 px-1.5 py-0.5 rounded text-white" style={{ background: PURPLE }}>IN</span>
      </div>
      <div className="flex items-center gap-4 text-neutral-800">
        <button onClick={() => navigate({ name: "search" })} aria-label="Search"><Search className="w-5 h-5" /></button>
        <button onClick={() => toast("Notifications coming soon ✨")} aria-label="Notifications"><Bell className="w-5 h-5" /></button>
        <button onClick={openProfile} className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-bold flex items-center justify-center">U</button>
      </div>
    </div>
  );
}

function BottomNav() {
  const { screen, navigate, toast } = useApp();
  const cur = screen.name;
  const items = [
    { key: "home", label: "Home", icon: Home, action: () => navigate({ name: "feed" }), active: cur === "feed" || cur === "search" },
    { key: "sparks", label: "Sparks", icon: Zap, action: () => navigate({ name: "feed" }), active: cur === "feed" || cur === "player" || cur === "create" || cur === "analytics", special: true },
    { key: "shorts", label: "Shorts", icon: PlaySquare, action: () => navigate({ name: "shorts" }), active: cur === "shorts" },
    { key: "subs", label: "Subscriptions", icon: Bell, action: () => toast("Subscriptions coming soon ✨"), active: false },
    { key: "lib", label: "Library", icon: Library, action: () => navigate({ name: "library" }), active: cur === "library" },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex items-stretch z-30">
      {items.map((it) => {
        const Icon = it.icon;
        const color = it.special ? (it.active ? RED : "#374151") : it.active ? "#111" : "#6B7280";
        return (
          <button key={it.key} onClick={it.action} className="flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-neutral-50">
            <div className="relative">
              <Icon className="w-5 h-5" style={{ color }} fill={it.special && it.active ? RED : "none"} />
              {it.special && (
                <span className="absolute -top-1 -right-2 text-[8px] font-bold px-1 rounded text-white" style={{ background: it.active ? RED : PURPLE }}>NEW</span>
              )}
            </div>
            <span className="text-[10px]" style={{ color, fontWeight: it.active ? 700 : 400 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
 *  SCREEN 1: FEED
 * ============================================================ */
function FeedScreen() {
  const { navigate, selectedFilter, setSelectedFilter, hiddenFeed, hide, toggleSave, toast, openSheet } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { setAnimKey((k) => k + 1); }, [selectedFilter]);

  const filtered = useMemo(() => {
    const base = SPARKS.filter((s) => !hiddenFeed.has(s.id));
    if (selectedFilter === "For You") return base;
    if (selectedFilter === "Trending") return base.filter((s) => s.tags.includes("Trending"));
    if (selectedFilter === "Following") return [];
    return base.filter((s) => s.lang === selectedFilter);
  }, [selectedFilter, hiddenFeed]);

  const onTouchStart = (e: React.TouchEvent) => { if (window.scrollY === 0) startY.current = e.touches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPullY(Math.min(dy, 80));
  };
  const onTouchEnd = () => {
    if (pullY > 50) {
      setRefreshing(true);
      window.setTimeout(() => { setRefreshing(false); setAnimKey((k) => k + 1); toast("Feed refreshed"); }, 800);
    }
    setPullY(0); startY.current = null;
  };

  const openCardMenu = (s: Spark) => {
    openSheet({
      title: s.title,
      items: [
        { label: "▶ Play Now", onClick: () => navigate({ name: "player", videoId: s.id }) },
        { label: "＋ Save to Watch Later", onClick: () => toggleSave(s.id) },
        { label: "🚫 Not Interested", onClick: () => { hide(s.id); toast("Got it. We'll show fewer like this."); } },
        { label: "📤 Share", onClick: () => shareSpark(s, toast) },
        { label: "👤 Go to Channel", onClick: () => navigate({ name: "creator", creator: s.creator }) },
      ],
    });
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <TopBar />
      {(pullY > 0 || refreshing) && (
        <div className="flex justify-center py-2" style={{ height: refreshing ? 40 : Math.min(pullY, 60) }}>
          <Zap className="w-6 h-6 animate-spin" style={{ color: PURPLE }} fill={PURPLE} />
        </div>
      )}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <Zap className="w-5 h-5" style={{ color: PURPLE }} fill={PURPLE} />
        <h1 className="text-lg font-bold tracking-tight">Sparks</h1>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: LIGHT_PURPLE, color: PURPLE }}>3–8 MIN</span>
      </div>
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const sel = f === selectedFilter;
          return (
            <button key={f} onClick={() => setSelectedFilter(f)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                background: sel ? RED : "#F3F4F6",
                color: sel ? "white" : "#111",
                borderColor: sel ? RED : "transparent",
              }}>{f}</button>
          );
        })}
      </div>

      {refreshing ? (
        <div className="px-4 space-y-4">
          {[0,1,2].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-neutral-100">
              <div className="aspect-video bg-neutral-200 animate-pulse" />
              <div className="p-3 space-y-2"><div className="h-3 bg-neutral-200 rounded animate-pulse" /><div className="h-2 w-2/3 bg-neutral-200 rounded animate-pulse" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-10 h-10" style={{ color: PURPLE }} />}
          title={selectedFilter === "Following" ? "No Following yet" : "No Sparks here"}
          subtitle={selectedFilter === "Following" ? "Subscribe to creators to see their Sparks here." : "Try another filter."}
          ctaLabel="Explore Sparks"
          onCta={() => setSelectedFilter("For You")}
        />
      ) : (
        <div key={animKey} className="px-4 space-y-4 pb-4 animate-[slideInRight_.25s_ease-out]">
          {filtered.map((s) => (
            <SparkCard key={s.id} s={s} onTap={() => navigate({ name: "player", videoId: s.id })} onLongPress={() => openCardMenu(s)} />
          ))}
          <style>{`@keyframes slideInRight { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
        </div>
      )}
    </div>
  );
}

function SparkCard({ s, onTap, onLongPress }: { s: Spark; onTap: () => void; onLongPress: () => void }) {
  const timer = useRef<number | null>(null);
  const triggered = useRef(false);
  const start = () => {
    triggered.current = false;
    timer.current = window.setTimeout(() => { triggered.current = true; onLongPress(); }, 500);
  };
  const cancel = () => { if (timer.current) window.clearTimeout(timer.current); };
  const click = () => { if (!triggered.current) onTap(); };
  return (
    <div
      onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
      onClick={click}
      className="w-full text-left bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-l-[3px] cursor-pointer active:scale-[.99] transition-transform select-none"
      style={{ borderLeftColor: PURPLE }}
    >
      <div className="relative aspect-video bg-neutral-900 overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg`}
          alt={s.title}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${s.youtubeId}/mqdefault.jpg`; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: "rgba(0,0,0,0.55)" }}>
          <Zap className="w-3 h-3" fill="#FBBF24" stroke="#FBBF24" /> Spark
        </div>
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white bg-black/70">{fmtTime(s.durationSec)}</div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
        </div>
      </div>
      <div className="p-3 flex gap-3">
        <div className={`w-9 h-9 rounded-full shrink-0 bg-gradient-to-br ${s.avatar}`} />
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold leading-snug text-neutral-900 line-clamp-2">{s.title}</div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>{s.creator}</span><span>·</span><span>{s.views}</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: LIGHT_PURPLE, color: PURPLE }}>{s.flag} {s.lang}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onLongPress(); }} aria-label="More"><MoreVertical className="w-4 h-4 text-neutral-400" /></button>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: { icon: React.ReactNode; title: string; subtitle: string; ctaLabel?: string; onCta?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: LIGHT_PURPLE }}>{icon}</div>
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <div className="text-xs text-neutral-500 mt-1">{subtitle}</div>
      {ctaLabel && onCta && (
        <button onClick={onCta} className="mt-4 px-4 py-2 rounded-full text-xs font-semibold text-white" style={{ background: PURPLE }}>{ctaLabel}</button>
      )}
    </div>
  );
}

/* ============================================================
 *  SEARCH
 * ============================================================ */
function SearchScreen() {
  const { back, navigate } = useApp();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const results = SPARKS.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="h-14 flex items-center gap-2 px-3 sticky top-0 bg-white z-20 border-b border-neutral-100">
        <button onClick={back} className="p-2" aria-label="Back"><ArrowLeft className="w-5 h-5" /></button>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Sparks"
          className="flex-1 h-10 px-3 rounded-full bg-neutral-100 outline-none text-sm"
        />
        {q && <button onClick={() => setQ("")} className="p-2"><X className="w-4 h-4 text-neutral-500" /></button>}
      </div>
      {q && results.length === 0 ? (
        <EmptyState icon={<Search className="w-8 h-8" style={{ color: PURPLE }} />} title={`No Sparks found for "${q}"`} subtitle="Try a different search term." />
      ) : (
        <div className="px-4 py-3 space-y-4">
          {(q ? results : SPARKS).map((s) => (
            <SparkCard key={s.id} s={s} onTap={() => navigate({ name: "player", videoId: s.id })} onLongPress={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 *  CREATOR PROFILE
 * ============================================================ */
function CreatorScreen({ creator }: { creator: string }) {
  const { back, navigate, subs, toggleSub, toast, openDialog } = useApp();
  const list = SPARKS.filter((s) => s.creator === creator);
  const sample = list[0] || SPARKS[0];
  const isSub = subs.has(creator);
  const onSubClick = () => {
    if (isSub) {
      openDialog({
        title: `Unsubscribe from ${creator}?`, confirmLabel: "Unsubscribe", danger: true,
        onConfirm: () => { toggleSub(creator); toast("Unsubscribed"); },
      });
    } else {
      toggleSub(creator); toast(`Subscribed to ${creator}!`);
    }
  };
  return (
    <div>
      <div className="h-14 flex items-center justify-between px-3 sticky top-0 bg-white z-20 border-b border-neutral-100">
        <button onClick={back} className="p-2"><ArrowLeft className="w-5 h-5" /></button>
        <div className="text-sm font-semibold">{creator}</div>
        <div className="w-9" />
      </div>
      <div className={`h-28 bg-gradient-to-br ${sample.hue}`} />
      <div className="px-4 -mt-8 flex items-end gap-3">
        <div className={`w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br ${sample.avatar} shrink-0`} />
        <div className="flex-1 pb-1">
          <div className="text-base font-bold">{creator}</div>
          <div className="text-[11px] text-neutral-500">{sample.subs} subscribers</div>
        </div>
        <button onClick={onSubClick} className="px-4 py-1.5 rounded-full text-xs font-bold border-2"
          style={{
            background: isSub ? "#E5E7EB" : "transparent",
            borderColor: isSub ? "#E5E7EB" : RED,
            color: isSub ? "#111" : RED,
          }}>{isSub ? "Subscribed ✓" : "Subscribe"}</button>
      </div>
      <div className="px-4 mt-4">
        <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Recent Sparks</div>
        <div className="space-y-3">
          {(list.length ? list : SPARKS.slice(0, 3)).map((s) => (
            <SparkCard key={s.id} s={s} onTap={() => navigate({ name: "player", videoId: s.id })} onLongPress={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 *  LIBRARY
 * ============================================================ */
function LibraryScreen() {
  const { saved, navigate } = useApp();
  const list = SPARKS.filter((s) => saved.has(s.id));
  return (
    <div>
      <div className="h-14 flex items-center px-4 sticky top-0 bg-white z-20 border-b border-neutral-100">
        <div className="text-base font-bold">Library</div>
      </div>
      <div className="px-4 pt-3 text-xs font-semibold text-neutral-500 uppercase">Watch Later ({list.length})</div>
      {list.length === 0 ? (
        <EmptyState icon={<Bookmark className="w-8 h-8" style={{ color: PURPLE }} />} title="Nothing saved yet" subtitle="Tap save on any Spark to add it here."
          ctaLabel="Browse Sparks" onCta={() => navigate({ name: "feed" })} />
      ) : (
        <div className="px-4 py-3 space-y-4">
          {list.map((s) => (
            <SparkCard key={s.id} s={s} onTap={() => navigate({ name: "player", videoId: s.id })} onLongPress={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 *  SCREEN 2/3: PLAYER (simulated)
 * ============================================================ */
function PlayerScreen({ videoId, autoEnd }: { videoId: number; autoEnd?: boolean }) {
  const { back, navigate, liked, disliked, saved, subs, toggleLike, toggleDislike, toggleSave, toggleSub, toast, openSheet, openDialog } = useApp();
  const video = SPARKS.find((s) => s.id === videoId) || SPARKS[0];

  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsApi = useRef<ReturnType<typeof useYouTubePlayer> | null>(null);
  const autoEndAppliedRef = useRef(false);

  const handleProgress = useCallback(({ currentTime, duration, progress }: { currentTime: number; duration: number; progress: number }) => {
    setCurrentTime(currentTime);
    setDuration(duration);
    // Apply autoEnd once player is ready
    if (autoEnd && !autoEndAppliedRef.current && duration > 0 && controlsApi.current?.isReady) {
      autoEndAppliedRef.current = true;
      controlsApi.current.seekTo(duration * 0.91);
    }
    if (!ended && progress >= 90 && duration > 0) setEnded(true);
  }, [autoEnd, ended]);

  const isLiked = liked.has(videoId);
  const isDisliked = disliked.has(videoId);
  const isSaved = saved.has(videoId);
  const isSub = subs.has(video.creator);
  const baseLikes = 24000;
  const likeCount = baseLikes + (isLiked ? 1 : 0);

  const onSubClick = () => {
    if (isSub) {
      openDialog({
        title: `Unsubscribe from ${video.creator}?`, confirmLabel: "Unsubscribe", danger: true,
        onConfirm: () => { toggleSub(video.creator); toast("Unsubscribed"); },
      });
    } else {
      toggleSub(video.creator); toast(`Subscribed to ${video.creator}!`);
    }
  };

  const openMenu = () => openSheet({
    items: [
      { label: "📋 Report", onClick: () => toast("Report submitted") },
      { label: "🔗 Copy Link", onClick: () => copyLink(video, toast) },
      { label: "📌 Pin to Profile", onClick: () => toast("Pinned to your profile ✓") },
      { label: "🔕 Don't recommend this channel", onClick: () => toast("Got it. Fewer like this.") },
      { label: "ℹ️ About this Spark", onClick: () => toast(`${video.title} · ${fmtTime(video.durationSec)} · ${video.lang}`) },
    ],
  });

  const onShare = () => shareSpark(video, toast);
  const onSave = () => toggleSave(videoId);
  const onDownload = () => toast("Spark saved for offline viewing ✓");

  // Active chapter based on real currentTime
  const activeChapter = [...CHAPTERS].reverse().find((c) => currentTime >= c.sec) || CHAPTERS[0];

  const skipToEnd = () => {
    if (controlsApi.current && duration > 0) controlsApi.current.seekTo(duration * 0.91);
    else setEnded(true);
  };

  const overlay = (
    <>
      <button onClick={back} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button onClick={openMenu} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
        <MoreVertical className="w-5 h-5" />
      </button>
      {!ended && (
        <button onClick={skipToEnd} className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-medium border border-white/20 text-white">
          Skip to End →
        </button>
      )}
      {ended && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center px-6 animate-[fadeIn_.3s] text-white">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2" style={{ background: PURPLE }}>
            <Zap className="w-7 h-7 text-white" fill="white" />
          </div>
          <div className="text-base font-bold">Spark Complete</div>
          <div className="text-xs opacity-70 mt-1">You watched the {Math.round((duration || video.durationSec)/60)}-min Spark</div>
          <button
            onClick={() => { setEnded(false); controlsApi.current?.seekTo(0); toast("Now watching full video ▶"); }}
            className="mt-4 w-full max-w-[260px] py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: RED }}>
            <Play className="w-4 h-4" fill="white" /> Watch Full Video →
          </button>
          <button onClick={() => { if (!isSaved) { toggleSave(videoId, true); toast("Added to Watch Later ✓"); } }} className="mt-3 text-xs underline" style={{ color: isSaved ? "#9CA3AF" : "white" }} disabled={isSaved}>
            {isSaved ? "✓ Saved to Watch Later" : "+ Add to Watch Later"}
          </button>
          <button onClick={() => { setEnded(false); controlsApi.current?.seekTo(0); }} className="mt-3 text-xs flex items-center gap-1 opacity-80">
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
          <button onClick={back} className="mt-3 text-xs opacity-70">← Back to Sparks</button>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white">
      <VideoPlayer
        videoId={video.youtubeId}
        autoplay
        onProgress={handleProgress}
        onComplete={() => setEnded(true)}
        controlsRef={(api) => { controlsApi.current = api; }}
        overlay={overlay}
      />

      {/* Below player */}
      <div className="p-4">
        <h1 className="text-[16px] font-bold leading-snug text-neutral-900">{video.title}</h1>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
          <span>{video.views}</span><span>·</span><span>2 days ago</span>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: LIGHT_PURPLE, color: PURPLE }}>{video.flag} {video.lang}</span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button onClick={() => navigate({ name: "creator", creator: video.creator })} className={`w-10 h-10 rounded-full bg-gradient-to-br ${video.avatar} shrink-0`} />
          <button onClick={() => navigate({ name: "creator", creator: video.creator })} className="flex-1 text-left">
            <div className="text-sm font-semibold">{video.creator}</div>
            <div className="text-[11px] text-neutral-500">{video.subs} subscribers</div>
          </button>
          <button onClick={onSubClick} className="px-4 py-1.5 rounded-full text-xs font-bold border-2"
            style={{
              background: isSub ? "#E5E7EB" : "transparent",
              borderColor: isSub ? "#E5E7EB" : RED,
              color: isSub ? "#111" : RED,
            }}>{isSub ? "Subscribed ✓" : "Subscribe"}</button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <ActionPill onClick={() => toggleLike(videoId)} active={isLiked} icon={ThumbsUp} label={fmtCount(likeCount)} activeColor="#2563EB" />
          <ActionPill onClick={() => toggleDislike(videoId)} active={isDisliked} icon={ThumbsDown} activeColor="#2563EB" />
          <ActionPill onClick={onShare} icon={Share2} label="Share" />
          <ActionPill onClick={onSave} active={isSaved} icon={Bookmark} label={isSaved ? "Saved" : "Save"} activeColor={PURPLE} />
          <ActionPill onClick={onDownload} icon={Download} label="Download" />
        </div>

        {/* Chapters */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-neutral-500 mb-2">CHAPTERS</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CHAPTERS.map((c) => {
              const active = c.label === activeChapter.label;
              return (
                <button key={c.label} onClick={() => { controlsApi.current?.seekTo(c.sec); setEnded(false); }}
                  className="shrink-0 px-3 py-2 rounded-lg text-xs border transition-colors"
                  style={{
                    background: active ? LIGHT_PURPLE : "white",
                    borderColor: active ? PURPLE : "#E5E7EB",
                    color: active ? PURPLE : "#111",
                    fontWeight: active ? 600 : 500,
                  }}>{c.label} ({fmtTime(c.sec)})</button>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <CommentsBlock videoId={videoId} />
      </div>
    </div>
  );
}

function ActionPill({ onClick, active, icon: Icon, label, activeColor }: { onClick: () => void; active?: boolean; icon: React.ComponentType<{ className?: string; fill?: string }>; label?: string; activeColor?: string }) {
  return (
    <button onClick={onClick} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors"
      style={{
        background: active && activeColor ? `${activeColor}15` : "#F3F4F6",
        color: active && activeColor ? activeColor : "#111",
      }}>
      <Icon className="w-4 h-4" fill={active && activeColor ? activeColor : "none"} />
      {label && <span>{label}</span>}
    </button>
  );
}

function CommentsBlock({ videoId }: { videoId: number }) {
  const { comments, postComment, postReply, toggleCommentLike } = useApp();
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<"Top" | "Newest">("Top");
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const list = comments[videoId] || [];
  const sorted = sort === "Top" ? [...list].sort((a, b) => b.likes - a.likes) : list;

  return (
    <div className="mt-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full rounded-xl border border-neutral-200 p-3 flex items-center justify-between">
        <div className="text-sm font-medium">Comments <span className="text-neutral-500 font-normal">({fmtCount(2400 + list.length)})</span></div>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 animate-[fadeIn_.2s]">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setSortOpen((s) => !s)} className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
              {sort} Comments <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className="absolute mt-16 ml-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 text-xs">
                {(["Top", "Newest"] as const).map((s) => (
                  <button key={s} onClick={() => { setSort(s); setSortOpen(false); }} className="block px-4 py-2 hover:bg-neutral-50 w-32 text-left">{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 mb-4">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 rounded-full bg-neutral-100 text-sm outline-none" />
            <button onClick={() => { postComment(videoId, text); setText(""); }} disabled={!text.trim()} className="px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-40" style={{ background: PURPLE }}>Post</button>
          </div>
          <div className="space-y-3">
            {sorted.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold">{c.user}</div>
                  <div className="text-sm text-neutral-800 mt-0.5">{c.text}</div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-500">
                    <button onClick={() => toggleCommentLike(videoId, c.id)} className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" fill={c.likedByMe ? "#2563EB" : "none"} style={{ color: c.likedByMe ? "#2563EB" : undefined }} /> {c.likes}
                    </button>
                    <button onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(""); }}>Reply</button>
                  </div>
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-2 ml-3 space-y-2 border-l border-neutral-200 pl-3">
                      {c.replies.map((r) => (
                        <div key={r.id} className="text-xs"><span className="font-semibold">{r.user}</span> <span className="text-neutral-700">{r.text}</span></div>
                      ))}
                    </div>
                  )}
                  {replyTo === c.id && (
                    <div className="mt-2 flex gap-2">
                      <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Reply..." className="flex-1 px-3 py-1.5 rounded-full bg-neutral-100 text-xs outline-none" />
                      <button onClick={() => { postReply(videoId, c.id, replyText); setReplyText(""); setReplyTo(null); }} className="px-3 py-1.5 rounded-full text-[11px] font-bold text-white" style={{ background: PURPLE }}>Post</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 *  SCREEN 4: SHORTS
 * ============================================================ */
function ShortsScreen() {
  const { navigate, shortsLikes, toggleShortLike, shortsComments, postShortComment, subs, toggleSub, toast, openSheet } = useApp();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const items = [
    ...SHORTS_DATA.slice(0, 2),
    { isSpark: true } as const,
    ...SHORTS_DATA.slice(2),
  ];

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30) setIdx((i) => Math.min(items.length - 1, i + 1));
    if (e.deltaY < -30) setIdx((i) => Math.max(0, i - 1));
  };
  const touchY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (dy < -40) setIdx((i) => Math.min(items.length - 1, i + 1));
    if (dy > 40) setIdx((i) => Math.max(0, i - 1));
    touchY.current = null;
  };

  const current = items[idx];
  return (
    <div className="bg-black min-h-[calc(100vh-64px)] relative" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="h-12 flex items-center justify-between px-4 text-white">
        <div className="font-bold">Shorts</div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ name: "search" })}><Search className="w-5 h-5" /></button>
          <button onClick={() => toast("Menu coming soon ✨")}><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="px-3 pb-4">
        {"isSpark" in current ? (
          <div className="rounded-2xl overflow-hidden bg-white shadow-lg border-[3px]" style={{ borderColor: PURPLE }}>
            <div className="px-3 py-2 flex items-center gap-2" style={{ background: LIGHT_PURPLE }}>
              <Zap className="w-4 h-4" style={{ color: PURPLE }} fill={PURPLE} />
              <span className="text-xs font-bold" style={{ color: PURPLE }}>GO DEEPER</span>
              <span className="ml-auto text-[10px]" style={{ color: PURPLE }}>Recommended for you</span>
            </div>
            <button onClick={() => navigate({ name: "player", videoId: 1 })} className="w-full text-left">
              <div className="relative aspect-video bg-gradient-to-br from-indigo-700 via-purple-600 to-fuchsia-500">
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white bg-black/70">5 min</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"><Play className="w-6 h-6 text-white" fill="white" /></div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold leading-snug">IPL 2026 — Kohli's Last Season Explained</div>
                <div className="text-[11px] text-neutral-500 mt-1">CricketWithRohit · 5 min Spark</div>
                <div className="mt-3 py-2 rounded-full text-center text-xs font-bold border-2" style={{ borderColor: PURPLE, color: PURPLE }}>↓ Go Deeper</div>
                <div onClick={(e) => { e.stopPropagation(); setIdx((i) => i + 1); }} className="text-center text-[10px] text-neutral-400 mt-2">Skip → or swipe up</div>
              </div>
            </button>
          </div>
        ) : (
          <ShortItem
            key={current.id}
            data={current}
            paused={paused}
            onTogglePause={() => setPaused((p) => !p)}
            liked={shortsLikes[current.id]?.liked}
            likeCount={shortsLikes[current.id]?.count || 0}
            onLike={() => toggleShortLike(current.id)}
            onComment={() => setOpenComments(current.id)}
            onShare={() => navigator.share?.({ title: current.title, url: `https://youtube.com/shorts/${current.id}` }).catch(() => { navigator.clipboard?.writeText(`https://youtube.com/shorts/${current.id}`); toast("Link copied! ✓"); })}
            onMore={() => openSheet({
              items: [
                { label: "📋 Report", onClick: () => toast("Reported") },
                { label: "🚫 Not Interested", onClick: () => { setIdx((i) => i + 1); toast("Got it. Fewer like this."); } },
                { label: "🔗 Copy Link", onClick: () => { navigator.clipboard?.writeText(`https://youtube.com/shorts/${current.id}`); toast("Link copied! ✓"); } },
              ],
            })}
            following={subs.has(current.creator)}
            onFollow={() => { const ns = toggleSub(current.creator); toast(ns ? "Following ✓" : "Unfollowed"); }}
          />
        )}
      </div>

      {/* swipe indicators */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {items.map((_, i) => <div key={i} className="w-1 h-4 rounded-full" style={{ background: i === idx ? "white" : "rgba(255,255,255,.3)" }} />)}
      </div>

      {/* Shorts comments sheet */}
      {openComments && (
        <div className="absolute inset-0 z-[70] flex items-end" onClick={() => setOpenComments(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full bg-white rounded-t-2xl max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mt-2 mb-2 h-1 w-10 rounded-full bg-neutral-300" />
            <div className="px-4 pb-2 text-sm font-semibold">Comments</div>
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
              {(shortsComments[openComments] || []).map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600 shrink-0" />
                  <div><div className="text-[11px] font-semibold">{c.user}</div><div className="text-sm">{c.text}</div></div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-neutral-100 flex gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 rounded-full bg-neutral-100 text-sm outline-none" />
              <button onClick={() => { postShortComment(openComments, commentText); setCommentText(""); }} disabled={!commentText.trim()} className="px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-40" style={{ background: PURPLE }}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShortItem({ data, liked, likeCount, onLike, onComment, onShare, onMore, following, onFollow }: {
  data: { id: string; title: string; creator: string; hue: string };
  paused?: boolean; onTogglePause?: () => void;
  liked?: boolean; likeCount: number; onLike: () => void;
  onComment: () => void; onShare: () => void; onMore: () => void;
  following: boolean; onFollow: () => void;
}) {
  const sideRail = (
    <>
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 text-white">
        <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex flex-col items-center">
          <Heart className="w-7 h-7" fill={liked ? "#EF4444" : "none"} style={{ color: liked ? "#EF4444" : "white" }} />
          <span className="text-[10px] mt-0.5">{fmtCount(likeCount)}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onComment(); }} className="flex flex-col items-center">
          <MessageCircle className="w-7 h-7" /><span className="text-[10px] mt-0.5">42</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex flex-col items-center">
          <Share2 className="w-7 h-7" /><span className="text-[10px] mt-0.5">Share</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMore(); }}><MoreVertical className="w-6 h-6" /></button>
      </div>
      <div className="absolute bottom-3 left-3 right-16 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-orange-500" />
          <span className="text-xs font-semibold">{data.creator}</span>
          <button onClick={(e) => { e.stopPropagation(); onFollow(); }} className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ borderColor: following ? "rgba(255,255,255,.4)" : "white", background: following ? "rgba(255,255,255,.15)" : "transparent" }}>
            {following ? "Following ✓" : "Follow"}
          </button>
        </div>
        <div className="text-sm font-medium">{data.title}</div>
      </div>
    </>
  );

  return (
    <div className="rounded-xl overflow-hidden relative">
      <VideoPlayer
        videoId={data.id}
        aspect="aspect-[9/14]"
        autoplay
        showFullscreen={false}
        overlay={sideRail}
      />
    </div>
  );
}

/* ============================================================
 *  SCREEN 5: CREATE
 * ============================================================ */
function CreateScreen() {
  const { navigate, back, toast, openDialog } = useApp();
  const TOTAL = 1440; // 24:00
  const [startSec, setStartSec] = useState(90);
  const [endSec, setEndSec] = useState(405); // ~5:15
  const [lang, setLang] = useState<string | null>("Hindi");
  const [otherLang, setOtherLang] = useState("");
  const [cta, setCta] = useState("Watch the full 24-min breakdown →");
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [langError, setLangError] = useState(false);
  const [ctaError, setCtaError] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const dur = endSec - startSec;
  const durMin = dur / 60;
  const durOk = durMin >= 3 && durMin <= 8;
  const durOver = durMin > 8;
  const ctaOver = cta.length > 60;

  const dragHandle = (which: "L" | "R") => (e: React.PointerEvent) => {
    e.preventDefault();
    const track = trackRef.current!;
    const rect = track.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const sec = Math.round(ratio * TOTAL);
      if (which === "L") setStartSec(Math.min(sec, endSec - 30));
      else setEndSec(Math.max(sec, startSec + 30));
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  const previewSpark = SPARKS.find((s) => s.lang === lang) || SPARKS[0];

  const publish = () => {
    let bad = false;
    if (!durOk) { toast(durOver ? "Sparks must be under 8 minutes" : "Spark must be at least 3 minutes"); bad = true; }
    if (!lang || (lang === "Other" && !otherLang.trim())) { setLangError(true); bad = true; }
    if (!cta.trim() || ctaOver) { setCtaError(true); bad = true; }
    if (bad) return;
    setPublishing(true);
    window.setTimeout(() => {
      setPublishing(false);
      navigate({ name: "analytics", banner: "Your Spark is live! ⚡ Estimated reach: 12K–45K viewers" });
    }, 1500);
  };

  const onClose = () => openDialog({
    title: "Discard this Spark?", confirmLabel: "Discard", cancelLabel: "Keep Editing", danger: true,
    onConfirm: () => back(),
  });

  return (
    <div>
      <div className="h-14 flex items-center justify-between px-4 bg-neutral-900 text-white sticky top-0 z-20">
        <button onClick={onClose}><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-1.5 font-semibold text-sm">
          Create a Spark <Zap className="w-4 h-4" style={{ color: "#FBBF24" }} fill="#FBBF24" />
        </div>
        <button onClick={() => navigate({ name: "analytics" })} className="text-xs font-semibold" style={{ color: "#FBBF24" }}>Stats</button>
      </div>

      <div className="p-4 space-y-5">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: LIGHT_PURPLE, color: PURPLE }}>AI HIGHLIGHTS</div>
            <h2 className="text-sm font-semibold">AI Selected Clip</h2>
          </div>
          <div className="rounded-xl overflow-hidden bg-neutral-900">
            <div className="relative aspect-video bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] font-medium text-white">
                <span>0:00</span><span>24:00</span>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-[11px] font-semibold bg-black/60 px-2 py-1 rounded">
                Best segment: {fmtTime(startSec)} – {fmtTime(endSec)}
              </div>
            </div>
            {/* Trim track */}
            <div ref={trackRef} className="relative h-12 bg-neutral-800 select-none">
              <div className="absolute inset-y-0 bg-yellow-300/20 border-y-2 border-yellow-300"
                style={{ left: `${(startSec / TOTAL) * 100}%`, width: `${((endSec - startSec) / TOTAL) * 100}%` }} />
              <div onPointerDown={dragHandle("L")} className="absolute top-0 bottom-0 -translate-x-1/2 w-4 cursor-ew-resize flex items-center justify-center" style={{ left: `${(startSec / TOTAL) * 100}%` }}>
                <div className="w-1.5 h-8 rounded-sm bg-yellow-300" />
              </div>
              <div onPointerDown={dragHandle("R")} className="absolute top-0 bottom-0 -translate-x-1/2 w-4 cursor-ew-resize flex items-center justify-center" style={{ left: `${(endSec / TOTAL) * 100}%` }}>
                <div className="w-1.5 h-8 rounded-sm bg-yellow-300" />
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">Drag handles to trim</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: durOver ? "#FEE2E2" : durOk ? "#DCFCE7" : "#FEF3C7", color: durOver ? RED : durOk ? "#15803D" : "#92400E" }}>
              {durOk && <Check className="w-3 h-3" />}
              {durOver && <AlertCircle className="w-3 h-3" />}
              {Math.floor(durMin)} min {Math.round((dur % 60))} sec
            </span>
          </div>
          {durOver && <div className="text-[11px] mt-1" style={{ color: RED }}>Sparks must be under 8 minutes</div>}
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-2">Select language</h2>
          <div className="flex gap-2 flex-wrap">
            {["Hindi", "Tamil", "Telugu", "Other"].map((l) => {
              const sel = l === lang;
              return (
                <button key={l} onClick={() => { setLang(l); setLangError(false); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    background: sel ? PURPLE : "white",
                    color: sel ? "white" : "#111",
                    borderColor: langError ? RED : sel ? PURPLE : "#E5E7EB",
                  }}>{l}</button>
              );
            })}
          </div>
          {lang === "Other" && (
            <input value={otherLang} onChange={(e) => setOtherLang(e.target.value)} placeholder="Enter language" className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none" />
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-2">End-card CTA text</h2>
          <div className="rounded-xl border p-3" style={{ borderColor: ctaError || ctaOver ? RED : "#E5E7EB" }}>
            <input value={cta} onChange={(e) => { setCta(e.target.value); setCtaError(false); }} className="w-full text-sm outline-none" />
          </div>
          <div className="text-[10px] text-right mt-1" style={{ color: ctaOver ? RED : "#9CA3AF" }}>{cta.length} / 60</div>
          {ctaOver && <div className="text-[11px]" style={{ color: RED }}>Keep it under 60 characters</div>}
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-2">Spark preview</h2>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`shrink-0 w-16 aspect-video rounded-md bg-gradient-to-br ${previewSpark.hue} relative`}>
                <div className="absolute bottom-0.5 right-0.5 text-[8px] text-white bg-black/60 px-1 rounded">{i+1}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2 pt-2">
          <button onClick={() => setPreview(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold border-2" style={{ borderColor: PURPLE, color: PURPLE }}>
            Preview Spark
          </button>
          <button onClick={publish} disabled={publishing} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-70" style={{ background: RED }}>
            {publishing ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Publish Spark <Zap className="w-4 h-4" fill="white" /></>}
          </button>
        </div>
        <div className="text-center text-[11px] text-neutral-500">
          Estimated RPM: <span className="font-semibold text-neutral-700">₹0.80 – ₹2.40</span> per 1K views
        </div>
      </div>

      {preview && (
        <div className="absolute inset-0 z-[70] bg-black/80 flex items-center justify-center px-6" onClick={() => setPreview(false)}>
          <div className="w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`relative aspect-video bg-gradient-to-br ${previewSpark.hue}`}>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Zap className="w-10 h-10" style={{ color: "#FBBF24" }} fill="#FBBF24" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 px-2 py-1.5 rounded text-xs text-white font-semibold text-center" style={{ background: "rgba(0,0,0,.7)" }}>
                {cta}
              </div>
            </div>
            <button onClick={() => setPreview(false)} className="w-full py-3 text-sm font-semibold" style={{ color: PURPLE }}>Close Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 *  SCREEN 6: ANALYTICS
 * ============================================================ */
function AnalyticsScreen({ banner }: { banner?: string }) {
  const { back, navigate, toast, openSheet } = useApp();
  const [range, setRange] = useState<RangeKey>("Last 28 days");
  const data = ANALYTICS_RANGES[range];

  return (
    <div>
      <div className="h-14 flex items-center justify-between px-4 bg-neutral-900 text-white sticky top-0 z-20">
        <button onClick={back}><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-1.5 font-semibold text-sm">
          Sparks Analytics <Zap className="w-4 h-4" style={{ color: "#FBBF24" }} fill="#FBBF24" />
        </div>
        <button onClick={() => {
          const txt = `My Sparks earned ₹${data.earned} this period with ${data.completion}% completion rate! ⚡ #YouTubeSparks`;
          if (navigator.share) navigator.share({ text: txt }).catch(() => { navigator.clipboard?.writeText(txt); toast("Copied to clipboard ✓"); });
          else { navigator.clipboard?.writeText(txt); toast("Copied to clipboard ✓"); }
        }}><Share2 className="w-5 h-5" /></button>
      </div>

      <div className="p-4 space-y-4">
        {banner && (
          <div className="rounded-xl p-3 text-sm font-semibold text-white animate-[fadeIn_.3s]" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${RED})` }}>
            {banner}
          </div>
        )}

        <button onClick={() => openSheet({
          title: "Date range",
          items: (Object.keys(ANALYTICS_RANGES) as RangeKey[]).map((r) => ({
            label: r + (r === range ? "  ✓" : ""), onClick: () => setRange(r),
          })),
        })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-xs font-medium">
          {range} <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <div className="grid grid-cols-3 gap-2">
          <CountUpCard label="Spark Views" value={data.views} format={(n) => n.toLocaleString()} key={`v-${range}`} />
          <CountUpCard label="Completion" value={data.completion} format={(n) => `${n}%`} color="#15803D" key={`c-${range}`} />
          <CountUpCard label="Earned" value={data.earned} format={(n) => `₹${n.toLocaleString()}`} key={`e-${range}`} />
        </div>

        <div className="rounded-2xl p-4 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${PURPLE}, #4C1D95)` }}>
          <div className="text-[11px] uppercase tracking-wide opacity-80">Sparks → Long-form Conversion</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-4xl font-bold">18.4%</div>
            <div className="flex items-center gap-0.5 text-xs font-semibold pb-1.5" style={{ color: "#86EFAC" }}>
              <ArrowUpRight className="w-4 h-4" /> +4.2%
            </div>
          </div>
          <div className="text-[11px] opacity-80 mt-1">Viewers who watched your full video after a Spark</div>
        </div>

        <BarChart bars={data.bars} key={`b-${range}`} />

        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 text-sm font-semibold flex items-center justify-between">
            Top 3 Sparks <TrendingUp className="w-4 h-4 text-neutral-500" />
          </div>
          {SPARKS.slice(0, 3).map((s, i) => (
            <button key={s.id} onClick={() => navigate({ name: "player", videoId: s.id })} className="w-full px-4 py-3 flex items-center gap-3 border-b border-neutral-100 last:border-b-0 text-left hover:bg-neutral-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: LIGHT_PURPLE }}>
                <Zap className="w-4 h-4" style={{ color: PURPLE }} fill={PURPLE} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{s.title}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">{(5.2 - i).toFixed(1)}K · {71 - i*5}% · ₹{420 - i*110}</div>
              </div>
              <Sparkline data={[3+i, 5, 4, 6, 7, 8, 9-i]} />
            </button>
          ))}
        </div>

        <button onClick={() => navigate({ name: "feed" })} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1" style={{ background: LIGHT_PURPLE, color: PURPLE }}>
          Back to Sparks Feed <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CountUpCard({ label, value, format, color }: { label: string; value: number; format: (n: number) => string; color?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const from = 0; const to = value; const dur = 300;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="text-lg font-bold mt-1" style={{ color: color || "#111" }}>{format(n)}</div>
    </div>
  );
}

function BarChart({ bars }: { bars: Record<string, number> }) {
  const [animated, setAnimated] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => { setAnimated(false); const t = window.setTimeout(() => setAnimated(true), 30); return () => window.clearTimeout(t); }, [bars]);
  const colors: Record<string, string> = { Hindi: PURPLE, Tamil: "#A78BFA", Telugu: "#8B5CF6" };
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <div className="text-sm font-semibold mb-3">Sparks Completion by Language</div>
      <div className="space-y-2.5">
        {Object.entries(bars).map(([lang, pct]) => (
          <div key={lang}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">{lang}</span>
              <span className="text-neutral-500">{pct}%</span>
            </div>
            <button onClick={() => { setTip(`${lang}: ${pct}% completion rate`); window.setTimeout(() => setTip(null), 2000); }}
              className="block w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: animated ? `${pct}%` : "0%", background: colors[lang] }} />
            </button>
          </div>
        ))}
      </div>
      {tip && <div className="mt-3 text-[11px] text-center px-2 py-1.5 rounded-lg" style={{ background: LIGHT_PURPLE, color: PURPLE }}>{tip}</div>}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const w = 56, h = 22;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => `${i * step},${h - (d / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={PURPLE} strokeWidth="1.5" points={pts} />
    </svg>
  );
}

/* ============================================================
 *  UTILS
 * ============================================================ */
function fmtTime(s: number) {
  const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function fmtCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
function shareSpark(s: Spark, toast: (t: string) => void) {
  const url = `https://youtube.com/sparks/${s.id}`;
  if (navigator.share) {
    navigator.share({ title: s.title, text: "Watch this Spark ⚡", url }).catch(() => {
      navigator.clipboard?.writeText(url); toast("Link copied! ✓");
    });
  } else {
    navigator.clipboard?.writeText(url); toast("Link copied! ✓");
  }
}
function copyLink(s: Spark, toast: (t: string) => void) {
  navigator.clipboard?.writeText(`https://youtube.com/sparks/${s.id}`);
  toast("Link copied! ✓");
}
