import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  LockKeyhole,
  Moon,
  PanelTop,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  Unlock,
  UserPen,
  UserPlus,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { PREFIX, allItems, groups, totalNames } from './data/names.js';
import { hasSupabaseConfig, supabase } from './lib/supabase.js';

const layoutModes = ['grid', 'compact', 'list'];
const FALLBACK_SETTINGS = {
  effect_type: 'sweep',
  effect_duration: 1.7,
  effect_intensity: 0.82,
};

const ELEMENT_OPTIONS = [
  { value: '', label: 'Giữ mặc định' },
  { value: 'Mộc', label: 'Mộc' },
  { value: 'Hỏa', label: 'Hỏa' },
  { value: 'Thổ', label: 'Thổ' },
  { value: 'Kim', label: 'Kim' },
  { value: 'Thủy', label: 'Thủy' },
  { value: 'Âm', label: 'Âm' },
  { value: 'Dương', label: 'Dương' },
  { value: 'Tùy chỉnh', label: 'Tùy chỉnh' },
];

const FENG_COLORS = {
  thuy: '#0284c7',
  hoa: '#dc2626',
  moc: '#16a34a',
  kim: '#b45309',
  tho: '#d97706',
  am: '#7c3aed',
  duong: '#ca8a04',
};

const FAMOUS_NAMES = {
  Hades: { element: 'Thủy', color: FENG_COLORS.thuy },
  Lucifer: { element: 'Hỏa', color: FENG_COLORS.hoa },
  Zeus: { element: 'Mộc', color: FENG_COLORS.moc },
  Poseidon: { element: 'Thủy', color: '#0891b2' },
  Ares: { element: 'Hỏa', color: '#ea580c' },
  Apollo: { element: 'Hỏa', color: '#e11d48' },
  Athena: { element: 'Kim', color: '#b45309' },
  Artemis: { element: 'Mộc', color: '#4d7c0f' },
  Hera: { element: 'Thổ', color: '#ca8a04' },
  Thanatos: { element: 'Âm', color: FENG_COLORS.am },
  Nyx: { element: 'Âm', color: '#8b5cf6' },
  Chaos: { element: 'Âm', color: '#6d28d9' },
  Kronos: { element: 'Thổ', color: '#ca8a04' },
  Atlas: { element: 'Thổ', color: '#d97706' },
  Typhon: { element: 'Hỏa', color: '#dc2626' },
  Cerberus: { element: 'Hỏa', color: '#b91c1c' },
  Medusa: { element: 'Mộc', color: '#15803d' },
  Heracles: { element: 'Kim', color: '#b45309' },
  Leonidas: { element: 'Kim', color: '#a16207' },
  Achilles: { element: 'Hỏa', color: '#c2410c' },
  Perseus: { element: 'Kim', color: '#4f46e5' },
  Charon: { element: 'Thủy', color: '#0369a1' },
  Tartarus: { element: 'Âm', color: '#6d28d9' },
  Odin: { element: 'Thổ', color: '#d97706' },
  Thor: { element: 'Kim', color: '#b45309' },
  Loki: { element: 'Mộc', color: '#65a30d' },
  Freya: { element: 'Mộc', color: '#15803d' },
  Frigg: { element: 'Kim', color: '#a16207' },
  Tyr: { element: 'Kim', color: '#b45309' },
  Baldr: { element: 'Hỏa', color: '#ca8a04' },
  Heimdall: { element: 'Kim', color: '#b45309' },
  Hel: { element: 'Âm', color: '#7c3aed' },
  Fenrir: { element: 'Thủy', color: '#2563eb' },
  Jormungandr: { element: 'Thủy', color: '#0891b2' },
  Ymir: { element: 'Thủy', color: '#0284c7' },
  Surtr: { element: 'Hỏa', color: '#dc2626' },
  Ragnarok: { element: 'Hỏa', color: '#e11d48' },
  Valhalla: { element: 'Kim', color: '#b45309' },
  'Lu Bu': { element: 'Hỏa', color: '#dc2626' },
  Adam: { element: 'Kim', color: '#a16207' },
  'Kojiro Sasaki': { element: 'Thủy', color: '#0284c7' },
  'Jack the Ripper': { element: 'Thủy', color: '#2563eb' },
  'Raiden Tameemon': { element: 'Thổ', color: '#d97706' },
  Buddha: { element: 'Thổ', color: '#ca8a04' },
  'Qin Shi Huang': { element: 'Thổ', color: '#c2410c' },
  'Nikola Tesla': { element: 'Kim', color: '#4f46e5' },
  'Soji Okita': { element: 'Kim', color: '#4338ca' },
  'Simo Hayha': { element: 'Thủy', color: '#0369a1' },
  'Sakata Kintoki': { element: 'Thổ', color: '#d97706' },
  'Michel Nostradamus': { element: 'Âm', color: '#9333ea' },
  'Grigori Rasputin': { element: 'Âm', color: '#7c3aed' },
  Shiva: { element: 'Hỏa', color: '#db2777' },
  Bishamonten: { element: 'Kim', color: '#b45309' },
  Zerofuku: { element: 'Âm', color: '#6d28d9' },
  Hajun: { element: 'Hỏa', color: '#b91c1c' },
  Beelzebub: { element: 'Âm', color: '#4f46e5' },
  "Susano'o no Mikoto": { element: 'Thủy', color: '#0891b2' },
  Anubis: { element: 'Thổ', color: '#b45309' },
  Brunhilde: { element: 'Kim', color: '#a16207' },
  Goll: { element: 'Mộc', color: '#15803d' },
  Thrud: { element: 'Thổ', color: '#d97706' },
  Hlokk: { element: 'Mộc', color: '#16a34a' },
  Alvitr: { element: 'Kim', color: '#4f46e5' },
  Gondul: { element: 'Hỏa', color: '#e11d48' },
  Indra: { element: 'Kim', color: '#b45309' },
  Kali: { element: 'Hỏa', color: '#be123c' },
  Amaterasu: { element: 'Hỏa', color: '#ca8a04' },
  Tsukuyomi: { element: 'Thủy', color: '#2563eb' },
  Enma: { element: 'Thổ', color: '#b45309' },
  Ra: { element: 'Hỏa', color: '#ca8a04' },
  Horus: { element: 'Kim', color: '#a16207' },
  'Sun Wukong': { element: 'Hỏa', color: '#ea580c' },
  Nezha: { element: 'Hỏa', color: '#e11d48' },
  'Cu Chulainn': { element: 'Mộc', color: '#15803d' },
  Morrigan: { element: 'Âm', color: '#7c3aed' },
  'Ahura Mazda': { element: 'Hỏa', color: '#ca8a04' },
  Eve: { element: 'Mộc', color: '#15803d' },
  Cain: { element: 'Hỏa', color: '#ea580c' },
  Abel: { element: 'Kim', color: '#a16207' },
  'The Serpent': { element: 'Mộc', color: '#16a34a' },
  Satan: { element: 'Hỏa', color: '#b91c1c' },
  Lilith: { element: 'Âm', color: '#9333ea' },
  Siegfried: { element: 'Kim', color: '#4f46e5' },
  Adamas: { element: 'Thổ', color: '#c2410c' },
  Fafnir: { element: 'Hỏa', color: '#dc2626' },
};

function makeDisplayName(name) {
  return `${PREFIX} ${name}`;
}

function isValidHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '');
}

function hexToRgb(hex) {
  const clean = (isValidHex(hex) ? hex : '#2dd4bf').replace('#', '').trim();
  const value = Number.parseInt(clean, 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

function shortOwner(name) {
  if (!name) return '';
  return name.length > 16 ? `${name.slice(0, 16)}…` : name;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getDefaultStyle(item) {
  return FAMOUS_NAMES[item.name] || null;
}

function getVisualStyle(item, styles) {
  const custom = styles[item.id];
  if (custom?.custom_color && custom?.custom_element) {
    return {
      element: custom.custom_element,
      color: custom.custom_color,
      custom: true,
    };
  }
  return getDefaultStyle(item);
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

function useOutsideClick(ref, onClose) {
  useEffect(() => {
    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [ref, onClose]);
}

function SelectBox({ icon: Icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div className="custom-select" ref={ref}>
      <button className={`select-trigger ${open ? 'is-open' : ''}`} type="button" onClick={() => setOpen((next) => !next)}>
        <Icon size={18} />
        <span className="select-trigger-text">{selected?.label || label}</span>
        <ChevronDown className={`select-chevron ${open ? 'is-open' : ''}`} size={18} />
      </button>
      {open && (
        <div className="select-menu">
          {options.map((option) => (
            <button
              className={`select-option ${option.value === value ? 'is-active' : ''}`}
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.count !== undefined && <strong>{option.count}</strong>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModalShell({ children, closing, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.documentElement.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('modal-open');
    };
  }, [onClose]);

  return (
    <div className={`modal-backdrop ${closing ? 'is-closing' : 'is-opening'}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-panel" role="dialog" aria-modal="true">
        {children}
      </section>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <header className="modal-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button className="icon-button" type="button" onClick={onClose} aria-label="Đóng modal">
        <X size={18} />
      </button>
    </header>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ror-theme') || 'dark');
  const [layout, setLayout] = useState('grid');
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [claims, setClaims] = useState({});
  const [nameStyles, setNameStyles] = useState({});
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [admin, setAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [modal, setModal] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [toast, setToast] = useState('');
  const [syncStatus, setSyncStatus] = useState(hasSupabaseConfig ? 'connecting' : 'local');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const scrollFrameRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ror-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--effect-duration', `${settings.effect_duration}s`);
    document.documentElement.style.setProperty('--effect-intensity', String(settings.effect_intensity));
    document.documentElement.style.setProperty('--effect-blur', String(Math.max(0.75, settings.effect_intensity * 1.35)));
  }, [settings]);

  function loadLocalData() {
    const localClaims = JSON.parse(localStorage.getItem('ror-local-claims') || '{}');
    const localSettings = JSON.parse(localStorage.getItem('ror-local-settings') || 'null');
    const localStyles = JSON.parse(localStorage.getItem('ror-local-name-styles') || '{}');
    setClaims(localClaims);
    setNameStyles(localStyles);
    if (localSettings) setSettings(localSettings);
  }

  async function fetchClaims() {
    if (!supabase) {
      loadLocalData();
      return;
    }
    const { data, error } = await supabase.from('ror_name_claims').select('*');
    if (error) {
      setSyncStatus('error');
      setToast(`Không đọc được Supabase: ${error.message}`);
      return;
    }
    setClaims(Object.fromEntries((data || []).map((claim) => [claim.name_id, claim])));
    setSyncStatus('online');
  }

  async function fetchNameStyles() {
    if (!supabase) {
      loadLocalData();
      return;
    }
    const { data, error } = await supabase.from('ror_name_styles').select('*');
    if (error) {
      setSyncStatus('error');
      setToast(`Không đọc được màu/mệnh: ${error.message}`);
      return;
    }
    setNameStyles(Object.fromEntries((data || []).map((style) => [style.name_id, style])));
  }

  async function fetchSettings() {
    if (!supabase) return;
    const { data, error } = await supabase.from('ror_ui_settings').select('*').eq('id', 'global').maybeSingle();
    if (error) {
      setSyncStatus('error');
      setToast(`Không đọc được hiệu ứng: ${error.message}`);
      return;
    }
    if (data) {
      setSettings({
        effect_type: data.effect_type || FALLBACK_SETTINGS.effect_type,
        effect_duration: Number(data.effect_duration || FALLBACK_SETTINGS.effect_duration),
        effect_intensity: Number(data.effect_intensity || FALLBACK_SETTINGS.effect_intensity),
      });
    }
  }

  useEffect(() => {
    let mounted = true;
    if (!hasSupabaseConfig || !supabase) {
      loadLocalData();
      setSyncStatus('local');
      return undefined;
    }

    async function boot() {
      setSyncStatus('connecting');
      await Promise.all([fetchClaims(), fetchNameStyles(), fetchSettings()]);
      if (mounted) setSyncStatus('online');
    }

    boot();

    const channel = supabase
      .channel('ror-name-registry-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ror_name_claims' }, () => fetchClaims())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ror_name_styles' }, () => fetchNameStyles())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ror_ui_settings' }, () => fetchSettings())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setSyncStatus('online');
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const groupOptions = useMemo(() => [
    { value: 'all', label: 'Tất cả nhóm', count: groups.length },
    ...groups.map((group) => ({ value: group.id, label: group.title, count: group.items.length })),
  ], []);

  const statusOptions = [
    { value: 'all', label: 'Tất cả', count: totalNames },
    { value: 'free', label: 'Còn trống' },
    { value: 'used', label: 'Đã dùng' },
  ];

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups
      .filter((group) => selectedGroup === 'all' || group.id === selectedGroup)
      .map((group) => {
        const items = group.items.filter((item) => {
          const claim = claims[item.id];
          const style = nameStyles[item.id];
          const used = Boolean(claim?.owner_name);
          const statusOk = statusFilter === 'all' || (statusFilter === 'used' ? used : !used);
          const haystack = `${item.name} ${item.desc} ${item.origin} ${group.title} ${claim?.owner_name || ''} ${claim?.identity_text || ''} ${claim?.note || ''} ${style?.custom_element || ''} ${style?.custom_color || ''}`.toLowerCase();
          return statusOk && (!normalized || haystack.includes(normalized));
        });
        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [claims, nameStyles, query, selectedGroup, statusFilter]);

  const visibleCount = filteredGroups.reduce((sum, group) => sum + group.items.length, 0);
  const usedCount = Object.keys(claims).length;
  const styledCount = allItems.filter((item) => getVisualStyle(item, nameStyles)).length;

  function openModal(nextModal) {
    window.clearTimeout(closeTimerRef.current);
    setModalClosing(false);
    setModal(nextModal);
  }

  function closeModal() {
    setModalClosing(true);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setModal(null);
      setModalClosing(false);
    }, 260);
  }

  async function verifyAdmin(password) {
    if (!password.trim()) return false;
    if (!supabase) {
      const localPassword = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD;
      return Boolean(localPassword && password === localPassword);
    }
    const { data, error } = await supabase.rpc('ror_admin_check', { p_admin_password: password });
    if (error) throw error;
    return Boolean(data);
  }

  async function handleAdminLogin(password) {
    setBusy(true);
    try {
      const ok = await verifyAdmin(password);
      if (!ok) {
        setToast('Sai mật khẩu admin hoặc chưa chạy SQL Supabase.');
        return false;
      }
      setAdmin(true);
      setAdminPassword(password);
      setToast('Đã bật Admin.');
      return true;
    } catch (error) {
      setToast(`Không đăng nhập được: ${error.message}`);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function upsertStyle(item, stylePayload) {
    const customColor = stylePayload?.custom_color;
    const customElement = stylePayload?.custom_element;
    const shouldSave = Boolean(customColor && customElement && isValidHex(customColor));

    if (!supabase) {
      const nextStyles = { ...nameStyles };
      if (shouldSave) {
        nextStyles[item.id] = {
          name_id: item.id,
          display_name: makeDisplayName(item.name),
          group_title: item.groupTitle,
          custom_element: customElement,
          custom_color: customColor,
          updated_at: new Date().toISOString(),
        };
      } else {
        delete nextStyles[item.id];
      }
      setNameStyles(nextStyles);
      localStorage.setItem('ror-local-name-styles', JSON.stringify(nextStyles));
      return;
    }

    if (shouldSave) {
      const { error } = await supabase.rpc('ror_upsert_name_style', {
        p_admin_password: adminPassword,
        p_name_id: item.id,
        p_display_name: makeDisplayName(item.name),
        p_group_title: item.groupTitle,
        p_custom_element: customElement,
        p_custom_color: customColor,
      });
      if (error) throw error;
    } else if (nameStyles[item.id]) {
      const { error } = await supabase.rpc('ror_delete_name_style', {
        p_admin_password: adminPassword,
        p_name_id: item.id,
      });
      if (error) throw error;
    }
    await fetchNameStyles();
  }

  async function saveNameAdmin(item, claimPayload, stylePayload) {
    setBusy(true);
    try {
      const owner = claimPayload.owner_name.trim();
      if (!supabase) {
        const nextClaims = { ...claims };
        if (owner) {
          nextClaims[item.id] = {
            name_id: item.id,
            display_name: makeDisplayName(item.name),
            group_title: item.groupTitle,
            owner_name: owner,
            identity_text: claimPayload.identity_text.trim(),
            note: claimPayload.note.trim(),
            updated_at: new Date().toISOString(),
          };
        } else {
          delete nextClaims[item.id];
        }
        setClaims(nextClaims);
        localStorage.setItem('ror-local-claims', JSON.stringify(nextClaims));
      } else if (owner) {
        const { error } = await supabase.rpc('ror_upsert_name_claim', {
          p_admin_password: adminPassword,
          p_name_id: item.id,
          p_display_name: makeDisplayName(item.name),
          p_group_title: item.groupTitle,
          p_owner_name: owner,
          p_identity_text: claimPayload.identity_text.trim(),
          p_note: claimPayload.note.trim(),
        });
        if (error) throw error;
        await fetchClaims();
      } else if (claims[item.id]) {
        const { error } = await supabase.rpc('ror_delete_name_claim', {
          p_admin_password: adminPassword,
          p_name_id: item.id,
        });
        if (error) throw error;
        await fetchClaims();
      }

      await upsertStyle(item, stylePayload);
      setToast('Đã lưu.');
      closeModal();
    } catch (error) {
      setToast(`Không lưu được: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function releaseClaim(nameId) {
    setBusy(true);
    try {
      if (!supabase) {
        const nextClaims = { ...claims };
        delete nextClaims[nameId];
        setClaims(nextClaims);
        localStorage.setItem('ror-local-claims', JSON.stringify(nextClaims));
      } else {
        const { error } = await supabase.rpc('ror_delete_name_claim', {
          p_admin_password: adminPassword,
          p_name_id: nameId,
        });
        if (error) throw error;
        await fetchClaims();
      }
      setToast('Đã trả tên.');
      closeModal();
    } catch (error) {
      setToast(`Không trả tên được: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveEffectSettings(nextSettings) {
    setBusy(true);
    try {
      if (!supabase) {
        setSettings(nextSettings);
        localStorage.setItem('ror-local-settings', JSON.stringify(nextSettings));
      } else {
        const { error } = await supabase.rpc('ror_update_ui_settings', {
          p_admin_password: adminPassword,
          p_effect_type: nextSettings.effect_type,
          p_effect_duration: nextSettings.effect_duration,
          p_effect_intensity: nextSettings.effect_intensity,
        });
        if (error) throw error;
        await fetchSettings();
      }
      setToast('Đã lưu hiệu ứng.');
      closeModal();
    } catch (error) {
      setToast(`Không lưu hiệu ứng được: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function copyAvailableNames() {
    const text = allItems
      .filter((item) => !claims[item.id])
      .map((item) => makeDisplayName(item.name))
      .join('\n');
    await copyToClipboard(text);
    setToast('Đã copy tên trống.');
  }

  async function copyName(item) {
    await copyToClipboard(makeDisplayName(item.name));
    setCopied(item.id);
    window.setTimeout(() => setCopied(''), 900);
  }

  function exportData() {
    const payload = allItems.map((item) => ({
      name_id: item.id,
      display_name: makeDisplayName(item.name),
      group_title: item.groupTitle,
      status: claims[item.id] ? 'used' : 'free',
      style: nameStyles[item.id] || null,
      claim: claims[item.id] || null,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ror-name-registry.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function scrollToTopAnimated() {
    window.cancelAnimationFrame(scrollFrameRef.current);
    const root = document.documentElement;
    const indicator = document.getElementById('scrollIndicator');
    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const duration = Math.min(1350, Math.max(520, startY * 0.72));
    const start = performance.now();
    root.classList.add('is-scroll-animating');

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const y = Math.round(startY * (1 - easeInOutCubic(progress)));
      window.scrollTo(0, y);
      if (indicator) indicator.style.width = `${Math.round(progress * 100)}%`;
      if (progress < 1) {
        scrollFrameRef.current = window.requestAnimationFrame(step);
      } else {
        window.setTimeout(() => {
          root.classList.remove('is-scroll-animating');
          if (indicator) indicator.style.width = '0%';
        }, 220);
      }
    }
    scrollFrameRef.current = window.requestAnimationFrame(step);
  }

  function scrollToNextGroup() {
    const sections = [...document.querySelectorAll('[data-group-section]')];
    if (!sections.length) return scrollToTopAnimated();
    const currentY = window.scrollY;
    const next = sections.find((section) => section.offsetTop > currentY + 128) || sections[0];
    const targetY = Math.max(0, next.offsetTop - 92);
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = Math.min(1200, Math.max(520, Math.abs(distance) * 0.7));
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      window.scrollTo(0, Math.round(startY + distance * easeInOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function cycleLayout() {
    const index = layoutModes.indexOf(layout);
    setLayout(layoutModes[(index + 1) % layoutModes.length]);
  }

  function layoutIcon() {
    if (layout === 'list') return <List size={18} />;
    if (layout === 'compact') return <PanelTop size={18} />;
    return <LayoutGrid size={18} />;
  }

  const syncClass = `sync-${syncStatus}`;
  const syncText = syncStatus === 'online' ? 'Supabase online' : syncStatus === 'connecting' ? 'Đang đồng bộ' : syncStatus === 'local' ? 'Local mode' : 'Supabase lỗi';

  return (
    <>
      <div className="scroll-to-top-indicator" id="scrollIndicator" aria-hidden="true" />
      <main className={`app layout-${layout}`}>
        <header className="topbar" id="top">
          <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); scrollToTopAnimated(); }}>
            <span className="brand-mark">RoR</span>
            <span className="brand-text">Record of Ragnarok</span>
          </a>
          <div className="top-actions">
            <button className={`soft-button ${admin ? 'is-active' : ''}`} type="button" onClick={() => (admin ? setAdmin(false) : openModal({ type: 'login' }))}>
              <ShieldCheck size={18} /> Admin
            </button>
            {admin && (
              <button className="soft-button" type="button" onClick={() => openModal({ type: 'effect' })}>
                <SlidersHorizontal size={18} /> Effect
              </button>
            )}
            <button className="soft-button" type="button" onClick={exportData}>
              <Download size={18} /> Export
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="eyebrow"><Sparkles size={16} /> Name Registry</div>
          <h1>Record of Ragnarok Name Archive</h1>
          <p>Bộ sưu tập tên thần thoại, nhân vật huyền thoại và tên hội phong cách Ragnarok.</p>
          <div className="stats">
            <span className="pill"><strong>{groups.length}</strong> nhóm</span>
            <span className="pill"><strong>{totalNames}</strong> tên</span>
            <span className="pill"><strong>{usedCount}</strong> đã dùng</span>
            <span className="pill"><strong>{totalNames - usedCount}</strong> còn trống</span>
            <span className="pill"><strong>{styledCount}</strong> nổi bật</span>
            <span className={`pill ${syncClass}`}><strong>{syncText}</strong></span>
            <span className="pill"><strong>{settings.effect_type}</strong> effect</span>
          </div>
        </section>

        <section className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Tìm tên, người dùng, ghi chú..." />
            {query && <button className="clear-button" type="button" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm"><X size={16} /></button>}
          </label>
          <SelectBox icon={Check} label="Trạng thái" options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
          <SelectBox icon={Filter} label="Nhóm" options={groupOptions} value={selectedGroup} onChange={setSelectedGroup} />
          <button className="soft-button primary copy-available" type="button" onClick={copyAvailableNames}>
            <Copy size={17} /> Copy tên trống
          </button>
        </section>

        <section className="summary-row">
          <div className="summary-left">
            <span className="pill">Đang hiển thị <strong>{visibleCount}</strong> / {totalNames}</span>
            <span className="pill">Admin <strong>{admin ? 'Bật' : 'Tắt'}</strong></span>
          </div>
          <button className="ghost-button" type="button" onClick={() => { setQuery(''); setSelectedGroup('all'); setStatusFilter('all'); }}>
            <RotateCcw size={17} /> Xóa lọc
          </button>
        </section>

        <section className="groups">
          {filteredGroups.map((group) => (
            <article className="group" key={group.id} data-group-section>
              <header className="group-header">
                <span className="pill origin-pill">{group.origin} · {group.items.length} tên</span>
                <h2>{group.title}</h2>
              </header>
              <div className="cards">
                {group.items.map((item, index) => (
                  <NameCard
                    admin={admin}
                    claim={claims[item.id]}
                    copied={copied === item.id}
                    index={index}
                    item={{ ...item, groupTitle: group.title }}
                    key={item.id}
                    onCopy={() => copyName(item)}
                    onOpenClaim={() => openModal({ type: 'claim', item: { ...item, groupTitle: group.title } })}
                    onOpenDetails={() => openModal({ type: 'details', item: { ...item, groupTitle: group.title } })}
                    settings={settings}
                    styleOverride={nameStyles[item.id]}
                  />
                ))}
              </div>
            </article>
          ))}
          {!filteredGroups.length && (
            <div className="empty-state">
              <h2>Không tìm thấy tên</h2>
              <button type="button" onClick={() => { setQuery(''); setSelectedGroup('all'); setStatusFilter('all'); }}>Xóa lọc</button>
            </div>
          )}
        </section>

        <div className="floating-tools">
          <button type="button" onClick={cycleLayout}>{layoutIcon()} <span>{layout === 'grid' ? 'Grid' : layout === 'compact' ? 'Compact' : 'List'}</span></button>
          <button type="button" onClick={() => {
            document.documentElement.classList.add('theme-switching');
            setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
            requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('theme-switching')));
          }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} <span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
          {admin && <button type="button" onClick={() => openModal({ type: 'effect' })}><SlidersHorizontal size={18} /> <span>Effect</span></button>}
          <button type="button" onClick={scrollToNextGroup}><ArrowDown size={18} /> <span>Next</span></button>
          <button type="button" onClick={scrollToTopAnimated}><ArrowUp size={18} /> <span>Top</span></button>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}

      {modal && (
        <ModalShell closing={modalClosing} onClose={closeModal}>
          {modal.type === 'login' && <LoginModal busy={busy} onClose={closeModal} onSubmit={handleAdminLogin} />}
          {modal.type === 'claim' && (
            <ClaimModal
              busy={busy}
              claim={claims[modal.item.id]}
              defaultStyle={getDefaultStyle(modal.item)}
              item={modal.item}
              onClose={closeModal}
              onRelease={() => releaseClaim(modal.item.id)}
              onSave={saveNameAdmin}
              styleOverride={nameStyles[modal.item.id]}
            />
          )}
          {modal.type === 'details' && (
            <DetailsModal
              admin={admin}
              busy={busy}
              claim={claims[modal.item.id]}
              item={modal.item}
              onClose={closeModal}
              onEdit={() => openModal({ type: 'claim', item: modal.item })}
              onRelease={() => releaseClaim(modal.item.id)}
              visualStyle={getVisualStyle(modal.item, nameStyles)}
              styleOverride={nameStyles[modal.item.id]}
            />
          )}
          {modal.type === 'effect' && <EffectModal busy={busy} settings={settings} onClose={closeModal} onSave={saveEffectSettings} />}
        </ModalShell>
      )}
    </>
  );
}

function NameCard({ admin, claim, copied, index, item, onCopy, onOpenClaim, onOpenDetails, settings, styleOverride }) {
  const visualStyle = styleOverride?.custom_color && styleOverride?.custom_element
    ? { element: styleOverride.custom_element, color: styleOverride.custom_color, custom: true }
    : FAMOUS_NAMES[item.name];
  const rgb = visualStyle ? hexToRgb(visualStyle.color) : '45, 212, 191';
  const used = Boolean(claim?.owner_name);
  const effectClass = visualStyle && settings.effect_type !== 'static' ? `effect-${settings.effect_type}` : '';

  function onCardClick() {
    if (used) onOpenDetails();
    else if (admin) onOpenClaim();
  }

  return (
    <article
      className={`name-card lazy-card is-visible ${visualStyle ? 'is-famous' : ''} ${effectClass} ${used ? 'is-used' : ''}`}
      onClick={onCardClick}
      style={{ '--feng': visualStyle?.color || '#2dd4bf', '--feng-rgb': rgb, '--delay': index % 8 }}
    >
      {visualStyle && settings.effect_type !== 'static' && <span className="effect-layer" aria-hidden="true" />}
      <div className="name-body">
        <div className="tag-row">
          <span className={`name-origin ${visualStyle ? 'feng-tag' : ''}`}>{item.origin}</span>
          {visualStyle && <span className="name-origin feng-tag">Mệnh {visualStyle.element}</span>}
          {styleOverride?.custom_color && <span className="name-origin custom-tag">Custom</span>}
          <span className={`name-origin ${used ? 'used-tag' : 'free-tag'}`}>{used ? 'Đã dùng' : 'Còn trống'}</span>
        </div>
        <h3>
          <span>{makeDisplayName(item.name)}</span>
          {used && (
            <span className="owner-inline" title={claim.owner_name}>
              (<UserRoundCheck size={12} /><span className="owner-name">{shortOwner(claim.owner_name)}</span>)
            </span>
          )}
        </h3>
        <p>{item.desc}</p>
      </div>
      <div className="card-actions">
        <button className="icon-button" type="button" onClick={(event) => { event.stopPropagation(); onCopy(); }} aria-label="Copy tên">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
        {admin && (
          <button className="icon-button" type="button" onClick={(event) => { event.stopPropagation(); onOpenClaim(); }} aria-label="Quản trị tên">
            {used ? <UserPen size={18} /> : <UserPlus size={18} />}
          </button>
        )}
      </div>
    </article>
  );
}

function LoginModal({ busy, onClose, onSubmit }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    const ok = await onSubmit(password);
    if (ok) onClose();
    else setError('Không đăng nhập được.');
  }

  return (
    <form onSubmit={submit}>
      <ModalHeader title="Đăng nhập Admin" onClose={onClose} />
      <div className="modal-body">
        <label className="field">
          <span>Mật khẩu admin</span>
          <input autoFocus value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Nhập mật khẩu admin" />
        </label>
        {error && <p className="error-text">{error}</p>}
      </div>
      <footer className="modal-actions">
        <span />
        <div className="modal-actions-right">
          <button className="ghost-button" type="button" onClick={onClose}>Hủy</button>
          <button className="soft-button success" type="submit" disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <LockKeyhole size={17} />} Đăng nhập</button>
        </div>
      </footer>
    </form>
  );
}

function ClaimModal({ busy, claim, defaultStyle, item, onClose, onRelease, onSave, styleOverride }) {
  const [owner, setOwner] = useState(claim?.owner_name || '');
  const [identity, setIdentity] = useState(claim?.identity_text || '');
  const [note, setNote] = useState(claim?.note || '');
  const [styleMode, setStyleMode] = useState(styleOverride ? 'custom' : 'default');
  const [element, setElement] = useState(styleOverride?.custom_element || defaultStyle?.element || '');
  const [customElement, setCustomElement] = useState(styleOverride?.custom_element && !ELEMENT_OPTIONS.some((option) => option.value === styleOverride.custom_element) ? styleOverride.custom_element : '');
  const [color, setColor] = useState(styleOverride?.custom_color || defaultStyle?.color || '#2dd4bf');
  const selectedElement = element === 'Tùy chỉnh' ? customElement.trim() : element;
  const canSave = owner.trim() || claim || styleMode === 'custom' || styleOverride;

  function resetDefault() {
    setStyleMode('default');
    setElement(defaultStyle?.element || '');
    setCustomElement('');
    setColor(defaultStyle?.color || '#2dd4bf');
  }

  function submit(event) {
    event.preventDefault();
    const stylePayload = styleMode === 'custom' && selectedElement && isValidHex(color)
      ? { custom_element: selectedElement, custom_color: color }
      : { custom_element: '', custom_color: '' };
    onSave(item, {
      owner_name: owner.trim(),
      identity_text: identity.trim(),
      note: note.trim(),
    }, stylePayload);
  }

  return (
    <form onSubmit={submit}>
      <ModalHeader title={makeDisplayName(item.name)} subtitle={item.desc} onClose={onClose} />
      <div className="modal-body">
        <label className="field">
          <span>Người đang dùng tên</span>
          <input autoFocus value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Tên người dùng / nhân vật" />
        </label>
        <label className="field">
          <span>Danh tính / liên hệ</span>
          <input value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder="Discord, Zalo, ID game, nhóm..." />
        </label>
        <label className="field">
          <span>Ghi chú</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú quản trị" />
        </label>

        <div className="field-grid two-columns">
          <label className="field">
            <span>Màu / mệnh</span>
            <select value={styleMode} onChange={(event) => setStyleMode(event.target.value)}>
              <option value="default">Giữ mặc định</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="field">
            <span>Mệnh</span>
            <select value={element} disabled={styleMode === 'default'} onChange={(event) => setElement(event.target.value)}>
              {ELEMENT_OPTIONS.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {styleMode === 'custom' && element === 'Tùy chỉnh' && (
          <label className="field">
            <span>Tên mệnh tùy chỉnh</span>
            <input value={customElement} onChange={(event) => setCustomElement(event.target.value)} placeholder="Ví dụ: Lôi, Băng, Hỗn Mang..." />
          </label>
        )}

        <div className="field-grid color-grid">
          <label className="field">
            <span>Màu</span>
            <input className="color-input" type="color" value={isValidHex(color) ? color : '#2dd4bf'} disabled={styleMode === 'default'} onChange={(event) => setColor(event.target.value)} />
          </label>
          <label className="field">
            <span>HEX</span>
            <input value={color} disabled={styleMode === 'default'} onChange={(event) => setColor(event.target.value)} placeholder="#0284c7" />
          </label>
        </div>

        <article className={`name-card preview-card ${styleMode === 'custom' ? 'is-famous effect-sweep' : defaultStyle ? 'is-famous effect-sweep' : ''}`} style={{ '--feng': styleMode === 'custom' ? color : (defaultStyle?.color || '#2dd4bf'), '--feng-rgb': hexToRgb(styleMode === 'custom' ? color : (defaultStyle?.color || '#2dd4bf')) }}>
          <span className="effect-layer" aria-hidden="true" />
          <div className="name-body">
            <div className="tag-row">
              <span className={(styleMode === 'custom' || defaultStyle) ? 'name-origin feng-tag' : 'name-origin'}>{item.origin}</span>
              {(styleMode === 'custom' ? selectedElement : defaultStyle?.element) && <span className="name-origin feng-tag">Mệnh {styleMode === 'custom' ? selectedElement : defaultStyle.element}</span>}
            </div>
            <h3><span>{makeDisplayName(item.name)}</span></h3>
            <p>{styleMode === 'custom' ? 'Custom từ database' : 'Giữ cấu hình gốc'}</p>
          </div>
        </article>
      </div>
      <footer className="modal-actions">
        <div className="modal-actions-left">
          <button className="ghost-button danger" type="button" onClick={onRelease} disabled={busy || !claim}>
            <Unlock size={17} /> Trả tên
          </button>
          <button className="ghost-button" type="button" onClick={resetDefault} disabled={busy}>
            <RefreshCw size={17} /> Mặc định
          </button>
        </div>
        <div className="modal-actions-right">
          <button className="ghost-button" type="button" onClick={onClose}>Hủy</button>
          <button className="soft-button success" type="submit" disabled={busy || !canSave || (styleMode === 'custom' && (!selectedElement || !isValidHex(color)))}>{busy ? <Loader2 className="spin" size={17} /> : <Save size={17} />} Lưu</button>
        </div>
      </footer>
    </form>
  );
}

function DetailsModal({ admin, busy, claim, item, onClose, onEdit, onRelease, visualStyle, styleOverride }) {
  return (
    <>
      <ModalHeader title={makeDisplayName(item.name)} subtitle={item.desc} onClose={onClose} />
      <div className="modal-body detail-grid">
        <div className="detail-box"><strong>Người đang sử dụng</strong>{claim?.owner_name || 'Chưa khai báo'}</div>
        <div className="detail-box"><strong>Danh tính / liên hệ</strong>{claim?.identity_text || 'Chưa khai báo'}</div>
        <div className="detail-box"><strong>Ghi chú</strong>{claim?.note || 'Không có ghi chú'}</div>
        <div className="detail-box"><strong>Màu / mệnh</strong>{visualStyle ? `${visualStyle.element} · ${visualStyle.color}${styleOverride ? ' · Custom' : ''}` : 'Không có'}</div>
        <div className="detail-box"><strong>Cập nhật</strong>{claim?.updated_at ? new Date(claim.updated_at).toLocaleString('vi-VN') : styleOverride?.updated_at ? new Date(styleOverride.updated_at).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</div>
      </div>
      <footer className="modal-actions">
        {admin ? (
          <button className="ghost-button danger" type="button" onClick={onRelease} disabled={busy || !claim}>
            <Trash2 size={17} /> Trả tên
          </button>
        ) : <span />}
        <div className="modal-actions-right">
          {admin && <button className="soft-button" type="button" onClick={onEdit}><UserPen size={17} /> Sửa</button>}
          <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
        </div>
      </footer>
    </>
  );
}

function EffectModal({ busy, settings, onClose, onSave }) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    document.documentElement.style.setProperty('--effect-duration', `${form.effect_duration}s`);
    document.documentElement.style.setProperty('--effect-intensity', String(form.effect_intensity));
    document.documentElement.style.setProperty('--effect-blur', String(Math.max(0.75, form.effect_intensity * 1.35)));
  }, [form]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setForm(FALLBACK_SETTINGS);
  }

  return (
    <>
      <ModalHeader title="Thiết lập hiệu ứng" onClose={onClose} />
      <div className="modal-body">
        <label className="field">
          <span>Kiểu hiệu ứng</span>
          <select value={form.effect_type} onChange={(event) => update('effect_type', event.target.value)}>
            <option value="sweep">Sweep</option>
            <option value="pulse">Pulse</option>
            <option value="breathe">Breathe</option>
            <option value="static">Static</option>
          </select>
        </label>
        <label className="field">
          <span>Thời gian: {Number(form.effect_duration).toFixed(1)}s</span>
          <input type="range" min="0.4" max="8" step="0.1" value={form.effect_duration} onChange={(event) => update('effect_duration', Number(event.target.value))} />
        </label>
        <label className="field">
          <span>Cường độ: {Math.round(Number(form.effect_intensity) * 100)}%</span>
          <input type="range" min="0.2" max="1" step="0.05" value={form.effect_intensity} onChange={(event) => update('effect_intensity', Number(event.target.value))} />
        </label>
        <article className={`name-card is-famous effect-${form.effect_type} preview-card`} style={{ '--feng': '#0284c7', '--feng-rgb': '2, 132, 199' }}>
          {form.effect_type !== 'static' && <span className="effect-layer" aria-hidden="true" />}
          <div className="name-body">
            <div className="tag-row"><span className="name-origin feng-tag">Preview</span></div>
            <h3><span>RoR · Hades</span></h3>
            <p>Preview</p>
          </div>
        </article>
      </div>
      <footer className="modal-actions">
        <button className="ghost-button" type="button" onClick={reset}><RefreshCw size={17} /> Mặc định</button>
        <div className="modal-actions-right">
          <button className="ghost-button" type="button" onClick={onClose}>Hủy</button>
          <button className="soft-button success" type="button" onClick={() => onSave(form)} disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <Save size={17} />} Lưu</button>
        </div>
      </footer>
    </>
  );
}

export default App;
