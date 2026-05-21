import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const themes = {
  dark: {
    name: 'Dark',
    bg: '#06060a',
    bgSecondary: '#0a0a12',
    bgCard: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
    border: 'rgba(255,255,255,0.08)',
    text: '#e4e4f0',
    textSecondary: '#c0c0d4',
    textMuted: '#6b6b8a',
    textDim: '#3d3d5c',
    accent: '#8b5cf6',
    accentGlow: 'rgba(139,92,246,0.25)',
    inputBg: 'rgba(255,255,255,0.04)',
    hoverBg: 'rgba(255,255,255,0.04)',
    tableHeaderBg: '#0f0f1a',
    navBg: 'rgba(10,10,18,0.85)',
    sidebarBg: '#0a0a12',
    modalBg: '#161625',
    scrollThumb: '#2a2a44',
    badgeText: '#fff',
    className: 'theme-dark',
  },
  midnight: {
    name: 'Midnight Blue',
    bg: '#0b0e1a',
    bgSecondary: '#0e1225',
    bgCard: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(30,58,138,0.03) 100%)',
    border: 'rgba(59,130,246,0.12)',
    text: '#e0e7ff',
    textSecondary: '#a5b4fc',
    textMuted: '#6366f1',
    textDim: '#3730a3',
    accent: '#6366f1',
    accentGlow: 'rgba(99,102,241,0.25)',
    inputBg: 'rgba(99,102,241,0.06)',
    hoverBg: 'rgba(99,102,241,0.06)',
    tableHeaderBg: '#0e1225',
    navBg: 'rgba(11,14,26,0.9)',
    sidebarBg: '#0e1225',
    modalBg: '#131836',
    scrollThumb: '#1e3a5f',
    badgeText: '#fff',
    className: 'theme-midnight',
  },
  emerald: {
    name: 'Emerald',
    bg: '#0a0f0d',
    bgSecondary: '#0d1512',
    bgCard: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,78,59,0.03) 100%)',
    border: 'rgba(16,185,129,0.12)',
    text: '#d1fae5',
    textSecondary: '#6ee7b7',
    textMuted: '#059669',
    textDim: '#064e3b',
    accent: '#10b981',
    accentGlow: 'rgba(16,185,129,0.25)',
    inputBg: 'rgba(16,185,129,0.06)',
    hoverBg: 'rgba(16,185,129,0.06)',
    tableHeaderBg: '#0d1512',
    navBg: 'rgba(10,15,13,0.9)',
    sidebarBg: '#0d1512',
    modalBg: '#0f1f1a',
    scrollThumb: '#134e4a',
    badgeText: '#fff',
    className: 'theme-emerald',
  },
  light: {
    name: 'Light',
    bg: '#f8f9fc',
    bgSecondary: '#ffffff',
    bgCard: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
    border: 'rgba(0,0,0,0.08)',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textDim: '#cbd5e1',
    accent: '#7c3aed',
    accentGlow: 'rgba(124,58,237,0.2)',
    inputBg: 'rgba(0,0,0,0.03)',
    hoverBg: 'rgba(0,0,0,0.03)',
    tableHeaderBg: '#f1f5f9',
    navBg: 'rgba(255,255,255,0.9)',
    sidebarBg: '#ffffff',
    modalBg: '#ffffff',
    scrollThumb: '#cbd5e1',
    badgeText: '#fff',
    className: 'theme-light',
  },
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('assetmgr-theme') || 'dark';
  });

  const theme = themes[themeName] || themes.dark;

  useEffect(() => {
    localStorage.setItem('assetmgr-theme', themeName);
    const root = document.documentElement;
    Object.keys(themes).forEach(t => root.classList.remove(themes[t].className));
    root.classList.add(theme.className);

    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--bg-card', theme.bgCard);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--text-dim', theme.textDim);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-glow', theme.accentGlow);
    root.style.setProperty('--input-bg', theme.inputBg);
    root.style.setProperty('--hover-bg', theme.hoverBg);
    root.style.setProperty('--table-header-bg', theme.tableHeaderBg);
    root.style.setProperty('--nav-bg', theme.navBg);
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--modal-bg', theme.modalBg);
    root.style.setProperty('--scroll-thumb', theme.scrollThumb);
  }, [themeName, theme]);

  const switchTheme = (name) => {
    if (themes[name]) setThemeName(name);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, switchTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
