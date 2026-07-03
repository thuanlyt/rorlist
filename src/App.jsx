import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Filter,
  LayoutGrid,
  List,
  Moon,
  Search,
  Shield,
  Sun,
  X,
} from 'lucide-react';
import { PREFIX, allItems, groups, totalNames } from './data/names.js';

const layoutModes = ['grid', 'compact', 'list'];

const FENG_COLORS = {
  thuy: '#38bdf8',
  hoa: '#ef4444',
  moc: '#22c55e',
  kim: '#e5e7eb',
  tho: '#f59e0b',
  am: '#818cf8',
};

const FAMOUS_NAMES = {
  Hades: { element: 'Thủy', color: FENG_COLORS.thuy },
  Lucifer: { element: 'Hỏa', color: FENG_COLORS.hoa },
  Zeus: { element: 'Mộc', color: FENG_COLORS.moc },
  Poseidon: { element: 'Thủy', color: '#06b6d4' },
  Ares: { element: 'Hỏa', color: '#f97316' },
  Apollo: { element: 'Hỏa', color: '#fb7185' },
  Athena: { element: 'Kim', color: '#cbd5e1' },
  Artemis: { element: 'Mộc', color: '#84cc16' },
  Thanatos: { element: 'Âm', color: FENG_COLORS.am },
  Nyx: { element: 'Âm', color: '#a78bfa' },
  Chaos: { element: 'Âm', color: '#94a3b8' },
  Kronos: { element: 'Thổ', color: '#ca8a04' },
  Atlas: { element: 'Thổ', color: '#f59e0b' },
  Typhon: { element: 'Hỏa', color: '#f43f5e' },
  Cerberus: { element: 'Hỏa', color: '#dc2626' },
  Medusa: { element: 'Mộc', color: '#16a34a' },
  Heracles: { element: 'Kim', color: '#f8fafc' },
  Leonidas: { element: 'Kim', color: '#cbd5e1' },
  Achilles: { element: 'Hỏa', color: '#fb923c' },
  Perseus: { element: 'Kim', color: '#bfdbfe' },
  Charon: { element: 'Thủy', color: '#67e8f9' },
  Tartarus: { element: 'Âm', color: '#8b5cf6' },
  Odin: { element: 'Thổ', color: '#f59e0b' },
  Thor: { element: 'Kim', color: '#f8fafc' },
  Loki: { element: 'Mộc', color: '#84cc16' },
  Freya: { element: 'Mộc', color: '#4ade80' },
  Frigg: { element: 'Kim', color: '#e2e8f0' },
  Tyr: { element: 'Kim', color: '#cbd5e1' },
  Baldr: { element: 'Hỏa', color: '#facc15' },
  Heimdall: { element: 'Kim', color: '#e5e7eb' },
  Hel: { element: 'Âm', color: '#a78bfa' },
  Fenrir: { element: 'Thủy', color: '#60a5fa' },
  Jormungandr: { element: 'Thủy', color: '#22d3ee' },
  Ymir: { element: 'Thủy', color: '#7dd3fc' },
  Surtr: { element: 'Hỏa', color: '#ef4444' },
  Ragnarok: { element: 'Hỏa', color: '#f43f5e' },
  Valhalla: { element: 'Kim', color: '#e5e7eb' },
  'Lu Bu': { element: 'Hỏa', color: '#ef4444' },
  Adam: { element: 'Kim', color: '#e5e7eb' },
  'Kojiro Sasaki': { element: 'Thủy', color: '#67e8f9' },
  'Jack the Ripper': { element: 'Thủy', color: '#93c5fd' },
  'Raiden Tameemon': { element: 'Thổ', color: '#d97706' },
  Buddha: { element: 'Thổ', color: '#eab308' },
  'Qin Shi Huang': { element: 'Thổ', color: '#d97706' },
  'Nikola Tesla': { element: 'Kim', color: '#a5b4fc' },
  'Soji Okita': { element: 'Kim', color: '#bfdbfe' },
  'Simo Hayha': { element: 'Thủy', color: '#7dd3fc' },
  'Sakata Kintoki': { element: 'Thổ', color: '#f59e0b' },
  'Michel Nostradamus': { element: 'Âm', color: '#c084fc' },
  'Grigori Rasputin': { element: 'Âm', color: '#a78bfa' },
  Shiva: { element: 'Hỏa', color: '#ec4899' },
  Bishamonten: { element: 'Kim', color: '#e5e7eb' },
  Zerofuku: { element: 'Âm', color: '#8b5cf6' },
  Hajun: { element: 'Hỏa', color: '#dc2626' },
  Beelzebub: { element: 'Âm', color: '#818cf8' },
  "Susano'o no Mikoto": { element: 'Thủy', color: '#22d3ee' },
  Anubis: { element: 'Thổ', color: '#ca8a04' },
  Brunhilde: { element: 'Kim', color: '#cbd5e1' },
  Goll: { element: 'Mộc', color: '#86efac' },
  Thrud: { element: 'Thổ', color: '#f59e0b' },
  Hlokk: { element: 'Mộc', color: '#22c55e' },
  Alvitr: { element: 'Kim', color: '#bfdbfe' },
  Gondul: { element: 'Hỏa', color: '#fb7185' },
  Indra: { element: 'Kim', color: '#f8fafc' },
  Kali: { element: 'Hỏa', color: '#e11d48' },
  Amaterasu: { element: 'Hỏa', color: '#facc15' },
  Tsukuyomi: { element: 'Thủy', color: '#60a5fa' },
  Enma: { element: 'Thổ', color: '#ca8a04' },
  Ra: { element: 'Hỏa', color: '#facc15' },
  Horus: { element: 'Kim', color: '#e5e7eb' },
  'Sun Wukong': { element: 'Hỏa', color: '#fb923c' },
  Nezha: { element: 'Hỏa', color: '#f43f5e' },
  'Cu Chulainn': { element: 'Mộc', color: '#22c55e' },
  Morrigan: { element: 'Âm', color: '#a78bfa' },
  'Ahura Mazda': { element: 'Hỏa', color: '#facc15' },
};


function safeRead(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) || fallback;
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function makeDisplayName(name) {
  return `${PREFIX} ${name}`;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function useOutsideClick(ref, onClose) {
  useEffect(() => {
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, onClose]);
}

function GroupSelect({ groups, value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useOutsideClick(rootRef, () => setOpen(false));

  const activeLabel =
    value === 'all'
      ? `Tất cả nhóm (${groups.length})`
      : `${groups.find((group) => group.id === value)?.title || 'Tất cả nhóm'}`;


  function scrollToTopAnimated() {
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);

    const root = document.documentElement;
    const indicator = document.getElementById('scrollIndicator');
    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const distance = startY;
    const duration = Math.min(1350, Math.max(620, distance * 0.72));
    const startTime = performance.now();

    root.classList.add('is-scroll-animating');

    if (distance <= 4) {
      if (indicator) indicator.style.width = '100%';
      window.setTimeout(() => {
        root.classList.remove('is-scroll-animating');
        if (indicator) indicator.style.width = '0%';
      }, 520);
      return;
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const nextY = Math.round(startY * (1 - eased));

      window.scrollTo(0, nextY);
      if (indicator) indicator.style.width = `${Math.round(eased * 100)}%`;

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, 0);
        if (indicator) indicator.style.width = '100%';
        window.setTimeout(() => {
          root.classList.remove('is-scroll-animating');
          if (indicator) indicator.style.width = '0%';
        }, 260);
      }
    }

    scrollFrameRef.current = requestAnimationFrame(step);
  }

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        className={`select-trigger ${open ? 'is-open' : ''}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Filter size={18} />
        <span className="select-trigger-text">{activeLabel}</span>
        <ChevronDown size={18} className={`select-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="select-menu" role="listbox" aria-label="Chọn nhóm">
          <button
            type="button"
            className={`select-option ${value === 'all' ? 'is-active' : ''}`}
            onClick={() => {
              onChange('all');
              setOpen(false);
            }}
          >
            <span>Tất cả nhóm</span>
            <strong>{totalNames}</strong>
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={`select-option ${value === group.id ? 'is-active' : ''}`}
              onClick={() => {
                onChange(group.id);
                setOpen(false);
              }}
            >
              <span>{group.title}</span>
              <strong>{group.items.length}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => safeRead('ror-theme', 'dark'));
  const [layout, setLayout] = useState(() => safeRead('ror-layout', 'grid'));
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [copied, setCopied] = useState('');
  const scrollFrameRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('ror-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('ror-layout', layout);
  }, [layout]);

  const filteredGroups = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return groups
      .filter((group) => activeGroup === 'all' || group.id === activeGroup)
      .map((group) => {
        const items = group.items.filter((item) => {
          const haystack = `${item.name} ${item.desc} ${group.title} ${item.origin}`.toLowerCase();
          return !keyword || haystack.includes(keyword);
        });

        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [activeGroup, query]);

  const filteredCount = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.items.length, 0),
    [filteredGroups]
  );

  const allText = useMemo(() => {
    return groups
      .map((group) => {
        const lines = group.items.map((item) => `${makeDisplayName(item.name)}: ${item.desc}`);
        return `${group.title}\n${lines.join('\n')}`;
      })
      .join('\n\n');
  }, []);

  const stats = useMemo(() => {
    const originCounts = {
      greek: allItems.filter((item) => item.origin === 'Hy Lạp').length,
      norse: allItems.filter((item) => item.origin === 'Bắc Âu').length,
      canon: allItems.filter((item) => item.origin === 'RoR Canon').length,
      famous: Object.keys(FAMOUS_NAMES).length,
    };
    return originCounts;
  }, []);


  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    document.querySelectorAll('.lazy-card').forEach((card) => observerRef.current.observe(card));

    return () => observerRef.current?.disconnect();
  }, [filteredGroups, layout]);

  async function handleCopy(id, text) {
    await copyToClipboard(text);
    setCopied(id);
    window.clearTimeout(window.__rorCopyTimer);
    window.__rorCopyTimer = window.setTimeout(() => setCopied(''), 1200);
  }

  function cycleLayout() {
    const currentIndex = layoutModes.indexOf(layout);
    setLayout(layoutModes[(currentIndex + 1) % layoutModes.length]);
  }

  function clearFilters() {
    setQuery('');
    setActiveGroup('all');
  }


  function scrollToTopAnimated() {
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);

    const root = document.documentElement;
    const indicator = document.getElementById('scrollIndicator');
    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const distance = startY;
    const duration = Math.min(1350, Math.max(620, distance * 0.72));
    const startTime = performance.now();

    root.classList.add('is-scroll-animating');

    if (distance <= 4) {
      if (indicator) indicator.style.width = '100%';
      window.setTimeout(() => {
        root.classList.remove('is-scroll-animating');
        if (indicator) indicator.style.width = '0%';
      }, 520);
      return;
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const nextY = Math.round(startY * (1 - eased));

      window.scrollTo(0, nextY);
      if (indicator) indicator.style.width = `${Math.round(eased * 100)}%`;

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, 0);
        if (indicator) indicator.style.width = '100%';
        window.setTimeout(() => {
          root.classList.remove('is-scroll-animating');
          if (indicator) indicator.style.width = '0%';
        }, 260);
      }
    }

    scrollFrameRef.current = requestAnimationFrame(step);
  }

  return (
    <main className={`app layout-${layout}`}>
      <div className="scroll-to-top-indicator" id="scrollIndicator" aria-hidden="true" />
      <header className="hero">
        <nav className="topbar" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Record of Ragnarok">
            <span className="brand-mark">RoR</span>
            <span className="brand-text">Record of Ragnarok</span>
          </a>
          <div className="top-actions">
            <button className="ghost-button" type="button" onClick={() => handleCopy('copy-all-top', allText)}>
              {copied === 'copy-all-top' ? <Check size={16} /> : <Copy size={16} />}
              Copy toàn bộ
            </button>
          </div>
        </nav>

        <section id="top" className="hero-panel">
          <div className="eyebrow">
            <Shield size={16} />
            Name Archive
          </div>
          <h1>Record of Ragnarok Name Archive</h1>
          <p>
            Bộ sưu tập tên thần thoại và nhân vật huyền thoại lấy cảm hứng từ Record of Ragnarok. Danh sách được phân nhóm theo hệ thần, cõi giới, chiến binh, Valkyrie, quái vật và các nhân vật nổi bật trong đại chiến giữa người và thần.
          </p>
          <div className="stats" aria-label="Thống kê danh sách">
            <span><strong>{groups.length}</strong> nhóm</span>
            <span><strong>{totalNames}</strong> tên</span>
            <span><strong>{stats.greek}</strong> Hy Lạp</span>
            <span><strong>{stats.norse}</strong> Bắc Âu</span>
            <span><strong>{stats.canon}</strong> RoR Canon</span>
            <span><strong>{stats.famous}</strong> nổi bật</span>
          </div>
        </section>
      </header>

      <section className="toolbar" aria-label="Bộ lọc danh sách">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, mô tả, nhóm..."
            type="search"
          />
          {query && (
            <button className="clear-button" type="button" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm">
              <X size={16} />
            </button>
          )}
        </label>

        <GroupSelect groups={groups} value={activeGroup} onChange={setActiveGroup} />

        <button className="soft-button" type="button" onClick={() => handleCopy('copy-all-toolbar', allText)}>
          {copied === 'copy-all-toolbar' ? <Check size={16} /> : <Copy size={16} />}
          Copy danh sách
        </button>
      </section>

      <section className="summary-row" aria-live="polite">
        <span>Đang hiển thị <strong>{filteredCount}</strong> / {totalNames} tên</span>
        {(query || activeGroup !== 'all') && (
          <button type="button" onClick={clearFilters}>Xóa lọc</button>
        )}
      </section>

      <section className="groups" aria-label="Danh sách tên phân nhóm">
        {filteredGroups.map((group) => (
          <article className="group" key={group.id}>
            <header className="group-header">
              <div>
                <span className="origin">{group.origin} · {group.items.length} tên</span>
                <h2>{group.title}</h2>
                <p>{group.subtitle}</p>
              </div>
            </header>

            <div className="cards">
              {group.items.map((item, index) => {
                const displayName = makeDisplayName(item.name);
                const isCopied = copied === item.id;
                const feng = FAMOUS_NAMES[item.name];

                return (
                  <article
                    className={`name-card lazy-card ${feng ? 'is-famous' : ''}`}
                    key={`${group.id}-${item.id}`}
                    style={feng ? { '--feng': feng.color, '--delay': index % 8 } : { '--delay': index % 8 }}
                  >
                    <div className="name-body">
                      <div className="tag-row">
                        <span className="name-origin">{group.origin}</span>
                        {feng && <span className="name-origin feng-tag">Mệnh {feng.element}</span>}
                      </div>
                      <h3>{displayName}</h3>
                      <p>{item.desc}</p>
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => handleCopy(item.id, displayName)}
                      aria-label={`Copy ${displayName}`}
                      title={isCopied ? 'Đã copy' : 'Copy tên'}
                    >
                      {isCopied ? <Check size={17} /> : <Copy size={17} />}
                    </button>
                  </article>
                );
              })}
            </div>
          </article>
        ))}

        {filteredGroups.length === 0 && (
          <div className="empty-state">
            <Search size={36} />
            <h2>Không tìm thấy tên phù hợp</h2>
            <p>Thử đổi từ khóa hoặc chọn lại nhóm khác.</p>
            <button type="button" onClick={clearFilters}>Xóa lọc</button>
          </div>
        )}
      </section>

      <div className="floating-tools" aria-label="Công cụ giao diện">
        <button type="button" onClick={cycleLayout} title="Đổi bố cục hiển thị">
          {layout === 'list' ? <List size={20} /> : <LayoutGrid size={20} />}
          <span>{layout === 'grid' ? 'Grid' : layout === 'compact' ? 'Compact' : 'List'}</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Đổi giao diện sáng/tối"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
        <button type="button" onClick={scrollToTopAnimated} title="Lên đầu trang">
          <ArrowUp size={20} />
          <span>Top</span>
        </button>
      </div>
    </main>
  );
}

export default App;
