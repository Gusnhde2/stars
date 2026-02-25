'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStarMap } from '@/hooks/useStarMap';
import { useExport } from '@/hooks/useExport';
import { StarMapCanvas } from '@/components/StarMap/StarMapCanvas';
import { PosterPreview } from '@/components/StarMap/PosterPreview';
import { FramedPreview } from '@/components/StarMap/FramedPreview';
import { PRESET_LOCATIONS } from '@/lib/astronomy/observer';
import { PAPER_SIZES, FRAME_SIZES, type PaperFormat, type PosterStyle } from '@/types/export';

type MobileView = 'controls' | 'preview';

type TabType = 'poster' | 'gift';

/* ── Constants ───────────────────────────────────────── */

const PAPER_FORMAT_OPTIONS: { value: PaperFormat; label: string }[] = [
  { value: 'a4', label: 'A4' },
  { value: 'a3', label: 'A3' },
  { value: 'a2', label: 'A2' },
  { value: 'letter', label: 'Letter' },
  { value: 'square-20', label: '20×20' },
  { value: 'square-30', label: '30×30' },
  { value: 'postcard', label: 'Card' },
  { value: '4x6', label: '4×6"' },
  { value: '5x7', label: '5×7"' },
  { value: '8x10', label: '8×10"' },
];

const STYLE_OPTIONS: { value: PosterStyle; label: string; desc: string }[] = [
  { value: 'minimal', label: 'Minimal', desc: 'Clean & simple' },
  { value: 'elegant', label: 'Elegant', desc: 'Gold accents' },
  { value: 'celestial', label: 'Celestial', desc: 'Dreamy & soft' },
  { value: 'modern', label: 'Modern', desc: 'Bold & sharp' },
];

/* ── Shared styles ───────────────────────────────────── */

const s = {
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#71717a',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 3,
    height: 12,
    borderRadius: 2,
    background: 'linear-gradient(180deg, #818cf8, #6366f1)',
    flexShrink: 0,
  },
  chip: {
    padding: '9px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500 as const,
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.07)',
    background: '#18181b',
    color: '#a1a1aa',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
  },
  chipActive: {
    padding: '9px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500 as const,
    cursor: 'pointer',
    border: '1px solid rgba(129,140,248,0.35)',
    background: 'rgba(129,140,248,0.1)',
    color: '#a5b4fc',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 10,
    fontSize: 13,
    fontFamily: 'inherit',
    color: '#fafafa',
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.07)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  smallBtn: {
    padding: '5px 10px',
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 600 as const,
    fontFamily: 'inherit',
    background: '#1e1e22',
    color: '#a1a1aa',
    border: '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  fieldLabel: {
    fontSize: 11,
    color: '#71717a',
    marginBottom: 4,
    display: 'block',
  },
  rangeLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rangeLabelText: {
    fontSize: 11,
    color: '#71717a',
  },
  rangeValue: {
    fontSize: 11,
    color: '#a1a1aa',
    fontVariantNumeric: 'tabular-nums' as const,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.05)',
    margin: '0',
  },
};

/* ── Main component ──────────────────────────────────── */

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('poster');
  const [showMore, setShowMore] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [mobileView, setMobileView] = useState<MobileView>('controls');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    observer, renderOptions, stars, geometry,
    setObserver, setRenderOptions, visibleStarCount, catalogStarCount,
  } = useStarMap();

  const {
    exportConfig, posterConfig, frameConfig, isExporting,
    setExportConfig, setPosterConfig, setFrameConfig,
    exportAsSVG, exportAsPNG, exportAsPoster,
  } = useExport();

  const handleExportSVG = useCallback(() => {
    if (geometry) exportAsSVG(geometry, renderOptions.theme);
  }, [geometry, renderOptions.theme, exportAsSVG]);

  const handleExportPNG = useCallback(async () => {
    await exportAsPNG(stars, observer, renderOptions);
  }, [stars, observer, renderOptions, exportAsPNG]);

  const handleExportPoster = useCallback(async () => {
    if (geometry) await exportAsPoster(geometry, renderOptions.theme);
  }, [geometry, renderOptions.theme, exportAsPoster]);

  const handleExport = useCallback(() => {
    if (activeTab === 'poster') {
      if (exportConfig.format === 'svg') handleExportSVG();
      else handleExportPNG();
    } else {
      handleExportPoster();
    }
  }, [activeTab, exportConfig.format, handleExportSVG, handleExportPNG, handleExportPoster]);

  /* ── Loading ── */
  if (!geometry) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(129,140,248,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              animation: 'pulse-ring 1.5s ease-in-out infinite',
            }} />
          </div>
          <p style={{ color: '#71717a', fontSize: 13 }}>Loading star catalog…</p>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1 as const, label: 'Design', icon: '◆' },
    { num: 2 as const, label: 'Location', icon: '◎' },
    { num: 3 as const, label: 'Export', icon: '↗' },
  ];

  return (
    <main className="app-main" style={{ height: '100vh', display: 'flex', background: '#09090b', overflow: 'hidden' }}>

      {/* ━━━━━━━━━━ SIDEBAR ━━━━━━━━━━ */}
      <aside className={`app-sidebar${isMobile && mobileView !== 'controls' ? ' mobile-hidden' : ''}`} style={{
        width: 440,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #111113 0%, #0c0c0e 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* ── Header ── */}
        <div className="sidebar-header" style={{ padding: '20px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
            }}>✦</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Celestial Cartographer
              </h1>
              <p style={{ fontSize: 11, color: '#52525b', letterSpacing: '0.04em', marginTop: 2 }}>
                Precision Star Maps
              </p>
            </div>
            <div style={{
              marginLeft: 'auto',
              padding: '4px 10px',
              borderRadius: 6,
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11,
              color: '#71717a',
              fontVariantNumeric: 'tabular-nums',
            }}>
              ★ {visibleStarCount.toLocaleString()} <span style={{ color: '#52525b' }}>/ {catalogStarCount.toLocaleString()}</span>
            </div>
          </div>

          {/* ── Step tabs ── */}
          <div style={{
            display: 'flex', gap: 4,
            background: '#0e0e10',
            borderRadius: 10,
            padding: 3,
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            {steps.map(({ num, label, icon }) => {
              const isActive = currentStep === num;
              const isDone = currentStep > num;
              return (
                <button
                  key={num}
                  onClick={() => setCurrentStep(num)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    background: isActive ? '#1e1e22' : 'transparent',
                    color: isActive ? '#fafafa' : isDone ? '#818cf8' : '#52525b',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  <span style={{ marginRight: 5, fontSize: 10, opacity: 0.7 }}>
                    {isDone ? '✓' : icon}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={s.divider} />

        {/* ── Scrollable content ── */}
        <div className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ╌╌╌ STEP 1: Design ╌╌╌ */}
          {currentStep === 1 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Theme */}
              <div>
                <div style={s.sectionLabel}><div style={s.sectionAccent} />Theme</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {([
                    { key: 'dark' as const, label: 'Midnight', gradient: 'linear-gradient(135deg,#0f1b3d,#182860)' },
                    { key: 'light' as const, label: 'Arctic', gradient: 'linear-gradient(135deg,#c8d0e0,#e8ecf4)' },
                    { key: 'monochrome' as const, label: 'Mono', gradient: 'linear-gradient(135deg,#1a1a1a,#333)' },
                    { key: 'sepia' as const, label: 'Sepia', gradient: 'linear-gradient(135deg,#d4c4a8,#f0e6d2)' },
                  ]).map(({ key, label, gradient }) => {
                    const active = renderOptions.theme === key;
                    return (
                      <button key={key} onClick={() => setRenderOptions({ theme: key })} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: active ? 'rgba(129,140,248,0.08)' : '#111113',
                        border: `1.5px solid ${active ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.2s ease',
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '50%',
                          background: gradient,
                          border: `2px solid ${active ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          transition: 'border-color 0.2s ease',
                        }} />
                        <span style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
                          color: active ? '#a5b4fc' : '#71717a',
                        }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map details */}
              <div>
                <div style={s.sectionLabel}><div style={s.sectionAccent} />Map details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {([
                    ['showConstellations', 'Constellations', '✧'],
                    ['showConstellationNames', 'Constellation names', 'Aa'],
                    ['showStarNames', 'Star labels', '★'],
                    ['showGrid', 'Grid lines', '⊞'],
                    ['showPlanets', 'Planets', '●'],
                    ['showHorizon', 'Horizon', '—'],
                  ] as const).map(([key, label, icon]) => {
                    const active = renderOptions[key] as boolean;
                    return (
                      <button key={key} onClick={() => setRenderOptions({ [key]: !renderOptions[key] })}
                        style={active ? { ...s.chipActive, gap: 8 } : { ...s.chip, gap: 8 }}>
                        <span style={{ fontSize: 12, opacity: 0.6, width: 16, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setShowMore(!showMore)} style={{
                  marginTop: 12, fontSize: 12, color: '#818cf8', cursor: 'pointer',
                  background: 'none', border: 'none', fontFamily: 'inherit', padding: 0,
                  opacity: 0.8, transition: 'opacity 0.15s',
                }}>
                  {showMore ? '− Less options' : '+ More options'}
                </button>

                {showMore && (
                  <div className="animate-in" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Toggle options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {([
                        ['showCardinals', 'Cardinal directions (N/E/S/W)'],
                        ['showDegreeRing', 'Degree ring'],
                        ['showTopoContours', 'Topographic contours'],
                        ['showMapCoordinates', 'Show coordinates on map'],
                        ['showMapDate', 'Show date on map'],
                      ] as const).map(([key, label]) => {
                        const active = renderOptions[key] as boolean;
                        return (
                          <button key={key} onClick={() => setRenderOptions({ [key]: !renderOptions[key] })}
                            style={active ? s.chipActive : s.chip}>
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Star style */}
                    <div>
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8 }}>Star rendering</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {([
                          { value: 'dots' as const, label: 'Dots', icon: '●' },
                          { value: 'glow' as const, label: 'Glow', icon: '✦' },
                          { value: 'spikes' as const, label: 'Spikes', icon: '✴' },
                        ]).map(({ value, label, icon }) => {
                          const active = renderOptions.starStyle === value;
                          return (
                            <button key={value} onClick={() => setRenderOptions({ starStyle: value })}
                              style={{ ...(active ? s.chipActive : s.chip), justifyContent: 'center', textAlign: 'center', flexDirection: 'column' as const, gap: 2, display: 'flex' }}>
                              <span style={{ fontSize: 16 }}>{icon}</span>
                              <span style={{ fontSize: 11 }}>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sliders */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <div style={s.rangeLabel}>
                          <span style={s.rangeLabelText}>Magnitude limit</span>
                          <span style={s.rangeValue}>{renderOptions.magnitudeLimit.toFixed(1)}</span>
                        </div>
                        <input type="range" min={2} max={6.5} step={0.5} value={renderOptions.magnitudeLimit}
                          onChange={(e) => setRenderOptions({ magnitudeLimit: parseFloat(e.target.value) })} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                          <span style={{ fontSize: 10, color: '#52525b' }}>Bright only</span>
                          <span style={{ fontSize: 10, color: '#52525b' }}>Faint stars</span>
                        </div>
                      </div>
                      <div>
                        <div style={s.rangeLabel}>
                          <span style={s.rangeLabelText}>Star size min</span>
                          <span style={s.rangeValue}>{renderOptions.starSizeMin.toFixed(1)}</span>
                        </div>
                        <input type="range" min={0.1} max={2} step={0.1} value={renderOptions.starSizeMin}
                          onChange={(e) => setRenderOptions({ starSizeMin: parseFloat(e.target.value) })} />
                      </div>
                      <div>
                        <div style={s.rangeLabel}>
                          <span style={s.rangeLabelText}>Star size max</span>
                          <span style={s.rangeValue}>{renderOptions.starSizeMax.toFixed(1)}</span>
                        </div>
                        <input type="range" min={2} max={4} step={0.1} value={renderOptions.starSizeMax}
                          onChange={(e) => setRenderOptions({ starSizeMax: parseFloat(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ╌╌╌ STEP 2: Location & Time ╌╌╌ */}
          {currentStep === 2 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Location */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={s.sectionLabel}><div style={s.sectionAccent} />Location</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => {
                      if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => setObserver({ ...observer, latitude: pos.coords.latitude, longitude: pos.coords.longitude, elevation: pos.coords.altitude || 0 }),
                          () => { }
                        );
                      }
                    }} style={s.smallBtn}>📍 Current</button>
                    <button onClick={() => setShowPresets(!showPresets)} style={s.smallBtn}>
                      Presets {showPresets ? '▴' : '▾'}
                    </button>
                  </div>
                </div>

                {showPresets && (
                  <div className="animate-in" style={{
                    marginBottom: 12, borderRadius: 10, background: '#111113',
                    border: '1px solid rgba(255,255,255,0.06)', maxHeight: 180, overflowY: 'auto',
                  }}>
                    {PRESET_LOCATIONS.map((p) => (
                      <button key={p.name} onClick={() => { setObserver({ ...observer, latitude: p.latitude, longitude: p.longitude, elevation: p.elevation }); setShowPresets(false); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                          fontSize: 13, color: '#a1a1aa', background: 'none', border: 'none',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.1s',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1e1e22'; e.currentTarget.style.color = '#fafafa'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a1a1aa'; }}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={s.fieldLabel}>Latitude</label>
                    <input type="number" value={observer.latitude} step="0.0001" style={s.input}
                      onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= -90 && v <= 90) setObserver({ ...observer, latitude: v }); }} />
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Longitude</label>
                    <input type="number" value={observer.longitude} step="0.0001" style={s.input}
                      onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= -180 && v <= 180) setObserver({ ...observer, longitude: v }); }} />
                  </div>
                </div>
                <div>
                  <label style={s.fieldLabel}>Elevation (m)</label>
                  <input type="number" value={observer.elevation} style={s.input}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setObserver({ ...observer, elevation: v }); }} />
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={s.sectionLabel}><div style={s.sectionAccent} />Date & Time</div>
                  <button onClick={() => setObserver({ ...observer, date: new Date() })} style={s.smallBtn}>
                    Set to now
                  </button>
                </div>

                <input
                  type="datetime-local"
                  value={new Date(observer.date.getTime() - observer.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setObserver({ ...observer, date: new Date(e.target.value) })}
                  style={{ ...s.input, marginBottom: 6 }}
                />
                <p style={{ fontSize: 10, color: '#52525b', fontVariantNumeric: 'tabular-nums', marginBottom: 12 }}>
                  UTC {observer.date.toISOString().slice(0, 19).replace('T', ' ')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={s.fieldLabel}>Adjust time</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[{ label: '−1h', delta: -1 }, { label: '+1h', delta: 1 }].map(({ label, delta }) => (
                        <button key={label} onClick={() => { const d = new Date(observer.date); d.setHours(d.getHours() + delta); setObserver({ ...observer, date: d }); }}
                          style={{ ...s.smallBtn, flex: 1, textAlign: 'center' }}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Adjust day</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[{ label: '−1d', delta: -1 }, { label: '+1d', delta: 1 }].map(({ label, delta }) => (
                        <button key={label} onClick={() => { const d = new Date(observer.date); d.setDate(d.getDate() + delta); setObserver({ ...observer, date: d }); }}
                          style={{ ...s.smallBtn, flex: 1, textAlign: 'center' }}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ╌╌╌ STEP 3: Export ╌╌╌ */}
          {currentStep === 3 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Tab switcher */}
              <div style={{
                display: 'flex', gap: 4,
                background: '#0e0e10', borderRadius: 10, padding: 3,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <button onClick={() => setActiveTab('poster')} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeTab === 'poster' ? '#1e1e22' : 'transparent',
                  color: activeTab === 'poster' ? '#fafafa' : '#52525b',
                  boxShadow: activeTab === 'poster' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}>✦ Star Map</button>
                <button onClick={() => setActiveTab('gift')} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeTab === 'gift' ? 'rgba(251,113,133,0.12)' : 'transparent',
                  color: activeTab === 'gift' ? '#fb7185' : '#52525b',
                  boxShadow: activeTab === 'gift' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}>♥ Gift Card</button>
              </div>

              {/* ── Star Map export ── */}
              {activeTab === 'poster' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Format</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {(['svg', 'png'] as const).map((f) => (
                        <button key={f} onClick={() => setExportConfig({ format: f })}
                          style={exportConfig.format === f ? { ...s.chipActive, justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' } : { ...s.chip, justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Size (mm)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                      {[100, 200, 300, 400].map((size) => (
                        <button key={size} onClick={() => setExportConfig({ widthMm: size, heightMm: size })}
                          style={exportConfig.widthMm === size ? { ...s.chipActive, justifyContent: 'center' } : { ...s.chip, justifyContent: 'center' }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportConfig.format === 'png' && (
                    <div className="animate-in">
                      <div style={s.sectionLabel}><div style={s.sectionAccent} />Resolution</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {([300, 600] as const).map((d) => (
                          <button key={d} onClick={() => setExportConfig({ dpi: d })}
                            style={exportConfig.dpi === d ? { ...s.chipActive, justifyContent: 'center' } : { ...s.chip, justifyContent: 'center' }}>
                            {d} DPI
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: '#52525b', marginTop: 6 }}>
                        Output: {Math.round(exportConfig.widthMm / 25.4 * exportConfig.dpi)}px
                      </p>
                    </div>
                  )}

                  {exportConfig.format === 'svg' && (
                    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button onClick={() => setExportConfig({ strokeOnly: !exportConfig.strokeOnly })}
                        style={exportConfig.strokeOnly ? s.chipActive : s.chip}>
                        Stroke only (engraving / CNC)
                      </button>
                      <button onClick={() => setExportConfig({ separateLayers: !exportConfig.separateLayers })}
                        style={exportConfig.separateLayers ? s.chipActive : s.chip}>
                        Separate layers
                      </button>
                      <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>
                        Vector format — ideal for printing & manufacturing
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Gift Card export ── */}
              {activeTab === 'gift' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Product format */}
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Product</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {(['print', 'canvas', 'framed'] as const).map((f) => (
                        <button key={f} onClick={() => setFrameConfig({ format: f })}
                          style={{ ...(frameConfig.format === f ? s.chipActive : s.chip), justifyContent: 'center', textTransform: 'capitalize' }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Framed options */}
                  {frameConfig.format === 'framed' && (
                    <>
                      <div className="animate-in">
                        <div style={s.sectionLabel}><div style={s.sectionAccent} />Frame finish</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                          {(['wood', 'white', 'black'] as const).map((f) => (
                            <button key={f} onClick={() => setFrameConfig({ frameFinish: f })}
                              style={{ ...(frameConfig.frameFinish === f ? s.chipActive : s.chip), justifyContent: 'center', textTransform: 'capitalize' }}>
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="animate-in">
                        <div style={s.sectionLabel}><div style={s.sectionAccent} />Layout</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {(['portrait', 'square'] as const).map((l) => (
                            <button key={l} onClick={() => setFrameConfig({ layout: l })}
                              style={{ ...(frameConfig.layout === l ? s.chipActive : s.chip), justifyContent: 'center', textTransform: 'capitalize' }}>
                              <span style={{ display: 'inline-block', width: l === 'portrait' ? 8 : 12, height: l === 'portrait' ? 12 : 12, border: '1.5px solid currentColor', borderRadius: 2, marginRight: 8, verticalAlign: 'middle' }} />
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="animate-in">
                        <div style={s.sectionLabel}><div style={s.sectionAccent} />Size</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {FRAME_SIZES.map((size) => (
                            <button key={size.label} onClick={() => setFrameConfig({ size })}
                              style={{ ...(frameConfig.size.label === size.label ? s.chipActive : s.chip), justifyContent: 'space-between' }}>
                              <span>{size.label}</span>
                              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${size.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Non-framed: paper size & orientation */}
                  {frameConfig.format !== 'framed' && (
                    <>
                      <div className="animate-in">
                        <div style={s.sectionLabel}><div style={s.sectionAccent} />Paper size</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 4 }}>
                          {PAPER_FORMAT_OPTIONS.map((o) => (
                            <button key={o.value} onClick={() => setPosterConfig({ paperFormat: o.value })}
                              style={{
                                ...(posterConfig.paperFormat === o.value ? s.chipActive : s.chip),
                                justifyContent: 'center', fontSize: 11, padding: '7px 4px',
                              }}>
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {!PAPER_SIZES[posterConfig.paperFormat].isSquare && (
                        <div className="animate-in">
                          <div style={s.sectionLabel}><div style={s.sectionAccent} />Orientation</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {(['portrait', 'landscape'] as const).map((o) => (
                              <button key={o} onClick={() => setPosterConfig({ orientation: o })}
                                style={{ ...(posterConfig.orientation === o ? s.chipActive : s.chip), justifyContent: 'center', textTransform: 'capitalize' }}>
                                <span style={{ display: 'inline-block', width: o === 'portrait' ? 8 : 14, height: o === 'portrait' ? 14 : 8, border: '1.5px solid currentColor', borderRadius: 2, marginRight: 8, verticalAlign: 'middle' }} />
                                {o}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div style={s.divider} />

                  {/* Poster style */}
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Style</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {STYLE_OPTIONS.map((o) => (
                        <button key={o.value} onClick={() => setPosterConfig({ style: o.value })}
                          style={{ ...(posterConfig.style === o.value ? s.chipActive : s.chip), flexDirection: 'column', alignItems: 'flex-start', gap: 2, display: 'flex' }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{o.label}</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>{o.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title / Subtitle / Note */}
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Content</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label style={s.fieldLabel}>Title</label>
                        <input type="text" value={posterConfig.title} placeholder="The Night We Met" style={s.input}
                          onChange={(e) => setPosterConfig({ title: e.target.value })} />
                      </div>
                      <div>
                        <label style={s.fieldLabel}>Subtitle</label>
                        <input type="text" value={posterConfig.subtitle} placeholder="Paris, France" style={s.input}
                          onChange={(e) => setPosterConfig({ subtitle: e.target.value })} />
                      </div>
                      <div>
                        <label style={s.fieldLabel}>Personal message</label>
                        <textarea value={posterConfig.note} onChange={(e) => setPosterConfig({ note: e.target.value })}
                          placeholder="Write a heartfelt message…" rows={3}
                          style={{ ...s.input, resize: 'none' as const }} />
                      </div>
                    </div>
                  </div>

                  {/* Display options */}
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Display</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {([
                        ['showDate', 'Show date'] as const,
                        ['showTime', 'Show time'] as const,
                        ['showCoordinates', 'Show coordinates'] as const,
                      ]).map(([key, label]) => (
                        <button key={key} onClick={() => setPosterConfig({ [key]: !posterConfig[key] })}
                          style={posterConfig[key] ? s.chipActive : s.chip}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Map layout */}
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Map</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label style={s.fieldLabel}>Position</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                          {(['top', 'center', 'bottom'] as const).map((p) => (
                            <button key={p} onClick={() => setPosterConfig({ mapPosition: p })}
                              style={{ ...(posterConfig.mapPosition === p ? s.chipActive : s.chip), justifyContent: 'center', textTransform: 'capitalize' }}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={s.fieldLabel}>Size</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                          {(['small', 'medium', 'large'] as const).map((sz) => (
                            <button key={sz} onClick={() => setPosterConfig({ mapSize: sz })}
                              style={{ ...(posterConfig.mapSize === sz ? s.chipActive : s.chip), justifyContent: 'center', textTransform: 'capitalize' }}>
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Font & Quality */}
                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Typography</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {([
                        { value: 'serif' as const, label: 'Serif', font: 'Georgia, serif' },
                        { value: 'sans' as const, label: 'Sans', font: "'Inter', sans-serif" },
                        { value: 'mono' as const, label: 'Mono', font: "'Courier New', monospace" },
                      ]).map((f) => (
                        <button key={f.value} onClick={() => setPosterConfig({ fontStyle: f.value })}
                          style={{ ...(posterConfig.fontStyle === f.value ? s.chipActive : s.chip), flexDirection: 'column', justifyContent: 'center', textAlign: 'center', display: 'flex', gap: 2 }}>
                          <span style={{ fontSize: 18, lineHeight: 1, fontFamily: f.font }}>Aa</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={s.sectionLabel}><div style={s.sectionAccent} />Print quality</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {([300, 600] as const).map((d) => (
                        <button key={d} onClick={() => setPosterConfig({ dpi: d })}
                          style={{ ...(posterConfig.dpi === d ? s.chipActive : s.chip), flexDirection: 'column', justifyContent: 'center', textAlign: 'center', display: 'flex', gap: 2 }}>
                          <span style={{ fontWeight: 700 }}>{d} DPI</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>{d === 300 ? 'Standard' : 'High quality'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer / Export ── */}
        <div className="sidebar-footer" style={{ padding: '12px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {currentStep === 3 ? (
            <button onClick={handleExport} disabled={isExporting} style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'inherit', cursor: isExporting ? 'not-allowed' : 'pointer',
              border: 'none', color: '#fff',
              background: isExporting ? '#27272a' : 'linear-gradient(135deg, #818cf8, #6366f1)',
              boxShadow: isExporting ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
              transition: 'all 0.3s ease',
              opacity: isExporting ? 0.5 : 1,
            }}>
              {isExporting ? 'Exporting…' : (
                activeTab === 'poster'
                  ? `Export ${exportConfig.format.toUpperCase()}`
                  : 'Export Poster'
              )}
            </button>
          ) : (
            <button onClick={() => setCurrentStep((currentStep + 1) as 1 | 2 | 3)} style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa',
              background: '#1e1e22', transition: 'all 0.2s ease',
            }}>
              Continue →
            </button>
          )}
          <p style={{ textAlign: 'center', fontSize: 11, color: '#3f3f46', marginTop: 8 }}>
            {activeTab === 'poster' && currentStep === 3 && exportConfig.format === 'svg'
              ? 'Vector format — ideal for print & manufacturing'
              : activeTab === 'poster' && currentStep === 3 && exportConfig.format === 'png'
                ? `Raster at ${exportConfig.dpi} DPI — ${Math.round(exportConfig.widthMm / 25.4 * exportConfig.dpi)}px`
                : `Step ${currentStep} of 3`
            }
          </p>
        </div>
      </aside>

      {/* ━━━━━━━━━━ PREVIEW ━━━━━━━━━━ */}
      <div className={`app-preview${isMobile && mobileView !== 'preview' ? ' mobile-hidden' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0c0c0e' }}>

        {/* Preview header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa' }}>Preview</span>
            <span style={{ fontSize: 11, color: '#3f3f46' }}>
              {observer.latitude.toFixed(2)}°, {observer.longitude.toFixed(2)}° · {observer.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* View mode tabs */}
          <div className="preview-header-tabs" style={{
            display: 'flex', gap: 2,
            background: '#111113', borderRadius: 8, padding: 2,
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <button onClick={() => setActiveTab('poster')} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer', border: 'none',
              background: activeTab === 'poster' ? '#1e1e22' : 'transparent',
              color: activeTab === 'poster' ? '#fafafa' : '#52525b',
              transition: 'all 0.15s',
            }}>Star Map</button>
            <button onClick={() => setActiveTab('gift')} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer', border: 'none',
              background: activeTab === 'gift' ? 'rgba(251,113,133,0.1)' : 'transparent',
              color: activeTab === 'gift' ? '#fb7185' : '#52525b',
              transition: 'all 0.15s',
            }}>Gift Card</button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="preview-canvas-area" style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? 16 : 32, minHeight: 0, position: 'relative',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }} />
          </div>

          {/* Preview card */}
          <div className="preview-card" style={{
            position: 'relative',
            background: '#09090b',
            borderRadius: isMobile ? 12 : 16,
            padding: activeTab === 'poster' ? (isMobile ? 12 : 24) : (isMobile ? 8 : 12),
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(129,140,248,0.03)',
            maxHeight: '100%',
            maxWidth: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {activeTab === 'poster' && (
              <StarMapCanvas geometry={geometry} theme={renderOptions.theme} size={isMobile ? Math.min(window.innerWidth - 56, 480) : 680} />
            )}
            {activeTab === 'gift' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: isMobile ? '100%' : 700 }}>
                {frameConfig.format === 'framed' ? (
                  <FramedPreview geometry={geometry} frameConfig={frameConfig} posterConfig={posterConfig} theme={renderOptions.theme} size={isMobile ? Math.min(window.innerWidth - 56, 420) : 580} />
                ) : (
                  <PosterPreview geometry={geometry} config={posterConfig} theme={renderOptions.theme} size={isMobile ? Math.min(window.innerWidth - 56, 420) : 580} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━ MOBILE BOTTOM BAR ━━━━━━━━━━ */}
      <div className="mobile-toggle-bar">
        <button
          onClick={() => setMobileView('controls')}
          style={{
            background: mobileView === 'controls' ? '#1e1e22' : 'transparent',
            color: mobileView === 'controls' ? '#fafafa' : '#52525b',
            boxShadow: mobileView === 'controls' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          ◆ Controls
        </button>
        <button
          onClick={() => setMobileView('preview')}
          style={{
            background: mobileView === 'preview' ? 'rgba(129,140,248,0.12)' : 'transparent',
            color: mobileView === 'preview' ? '#a5b4fc' : '#52525b',
            boxShadow: mobileView === 'preview' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          ✦ Preview
        </button>
      </div>
    </main>
  );
}
