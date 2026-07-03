import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUp,
  Check,
  Copy,
  Filter,
  Layers,
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

function App() {
  const [theme, setTheme] = useState(() => safeRead('ror-theme', 'dark'));
  const [layout, setLayout] = useState(() => safeRead('ror-layout', 'grid'));
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [copied, setCopied] = useState('');

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

  return (
    <main className={`app layout-${layout}`}>
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
            Mythology Master List
          </div>
          <h1>Danh sách tên Record of Ragnarok</h1>
          <p>
            Bộ tên đã phân nhóm theo thần thoại Hy Lạp, Bắc Âu và nhóm phản thần/vực sâu. Mỗi ô tên đều có nút copy riêng để dùng nhanh cho game, clan, Discord hoặc landing.
          </p>
          <div className="stats" aria-label="Thống kê danh sách">
            <span><strong>{groups.length}</strong> nhóm</span>
            <span><strong>{totalNames}</strong> tên</span>
            <span><strong>{allItems.filter((item) => item.origin === 'Hy Lạp').length}</strong> Hy Lạp</span>
            <span><strong>{allItems.filter((item) => item.origin === 'Bắc Âu').length}</strong> Bắc Âu</span>
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

        <label className="select-box">
          <Filter size={18} />
          <select value={activeGroup} onChange={(event) => setActiveGroup(event.target.value)}>
            <option value="all">Tất cả nhóm</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title} · {group.items.length}
              </option>
            ))}
          </select>
        </label>

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
                <span className="origin">{group.origin}</span>
                <h2>{group.title}</h2>
                <p>{group.subtitle}</p>
              </div>
              <span className="count">{group.items.length}</span>
            </header>

            <div className="cards">
              {group.items.map((item) => {
                const displayName = makeDisplayName(item.name);
                const text = `${displayName}: ${item.desc}`;
                const isCopied = copied === item.id;

                return (
                  <article className="name-card" key={item.id}>
                    <div className="name-body">
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
            <Layers size={36} />
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
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Lên đầu trang">
          <ArrowUp size={20} />
          <span>Top</span>
        </button>
      </div>
    </main>
  );
}

export default App;
