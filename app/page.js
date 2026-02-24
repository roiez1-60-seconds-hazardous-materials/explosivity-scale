"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

const GASES = {
  general: { name: "כללי / חינוכי", nameEn: "General", lel: 5, uel: 15, formula: "—", description: "ערכים כלליים להדגמה", color: "#64748b" },
  methane: { name: "מתאן", nameEn: "Methane", lel: 5.0, uel: 15.0, formula: "CH₄", description: "גז טבעי — דליק, חסר ריח וצבע", color: "#3b82f6" },
  propane: { name: "פרופאן", nameEn: "Propane", lel: 2.1, uel: 9.5, formula: "C₃H₈", description: "גז בישול ותעשייה, כבד מאוויר", color: "#f59e0b" },
  hydrogen: { name: "מימן", nameEn: "Hydrogen", lel: 4.0, uel: 75.0, formula: "H₂", description: "קל ביותר, טווח נפיצות רחב מאוד!", color: "#06b6d4" },
  butane: { name: "בוטאן", nameEn: "Butane", lel: 1.8, uel: 8.4, formula: "C₄H₁₀", description: "גז מציתים, כבד מאוויר", color: "#a855f7" },
  acetylene: { name: "אצטילן", nameEn: "Acetylene", lel: 2.5, uel: 100.0, formula: "C₂H₂", description: "גז ריתוך — מסוכן במיוחד!", color: "#ef4444" },
  ethanol: { name: "אתנול", nameEn: "Ethanol", lel: 3.3, uel: 19.0, formula: "C₂H₅OH", description: "אדי אלכוהול דליקים", color: "#10b981" },
  ammonia: { name: "אמוניה", nameEn: "Ammonia", lel: 15.0, uel: 28.0, formula: "NH₃", description: "גז רעיל ודליק, ריח חריף", color: "#f43f5e" },
  co: { name: "פחמן חד חמצני", nameEn: "Carbon Monoxide", lel: 12.5, uel: 74.0, formula: "CO", description: "הרוצח השקט — רעיל וחסר ריח", color: "#6366f1" },
  ethylene: { name: "אתילן", nameEn: "Ethylene", lel: 2.7, uel: 36.0, formula: "C₂H₄", description: "גז תעשייתי דליק", color: "#14b8a6" },
  lpg: { name: 'גפ"מ', nameEn: "LPG Mix", lel: 1.8, uel: 9.5, formula: "C₃/C₄", description: 'תערובת גפ"מ — גז ביתי', color: "#f97316" },
  hexane: { name: "הקסאן", nameEn: "Hexane", lel: 1.1, uel: 7.5, formula: "C₆H₁₄", description: "ממס תעשייתי נדיף", color: "#84cc16" },
};

const ZONE_COLORS = {
  safe: { bg: "#059669", glow: "#06d67d", label: "בטוח", icon: "✓", labelEn: "SAFE" },
  caution: { bg: "#d97706", glow: "#fbbf24", label: "זהירות — 10% LEL", icon: "⚠", labelEn: "CAUTION" },
  warning: { bg: "#ea580c", glow: "#fb923c", label: "אזהרה — 20% LEL", icon: "⚠", labelEn: "WARNING" },
  preLel: { bg: "#dc2626", glow: "#f87171", label: "סכנה — מתקרב ל-LEL", icon: "⛔", labelEn: "DANGER" },
  explosive: { bg: "#dc2626", glow: "#ff0040", label: "טווח נפיצות!", icon: "💥", labelEn: "EXPLOSIVE" },
  rich: { bg: "#7c3aed", glow: "#a78bfa", label: "עשיר מדי — מעל UEL", icon: "🚫", labelEn: "TOO RICH" },
};

function getZone(concentration, gas) {
  const lel10 = gas.lel * 0.1;
  const lel20 = gas.lel * 0.2;
  if (concentration <= lel10) return "safe";
  if (concentration <= lel20) return "caution";
  if (concentration <= gas.lel * 0.5) return "warning";
  if (concentration <= gas.lel) return "preLel";
  if (concentration <= gas.uel) return "explosive";
  return "rich";
}

function formatConcentration(value) {
  if (value < 0.1) return `${(value * 10000).toFixed(0)} ppm`;
  if (value < 1) return `${(value * 10000).toFixed(0)} ppm (${value.toFixed(2)}%)`;
  return `${value.toFixed(2)}% vol`;
}

export default function Home() {
  const [selectedGas, setSelectedGas] = useState("general");
  const [concentration, setConcentration] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showGasMenu, setShowGasMenu] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setAnimateIn(true); }, []);

  const gas = GASES[selectedGas];
  const zone = getZone(concentration, gas);
  const zoneInfo = ZONE_COLORS[zone];

  const maxScale = useMemo(() => {
    if (isZoomed) return Math.min(Math.max(gas.uel * 1.8, gas.lel * 5), 100);
    return 100;
  }, [gas, isZoomed]);

  const lel10Pct = (gas.lel * 0.1 / maxScale) * 100;
  const lel20Pct = (gas.lel * 0.2 / maxScale) * 100;
  const lelPct = (gas.lel / maxScale) * 100;
  const uelPct = Math.min((gas.uel / maxScale) * 100, 100);
  const sliderPct = (concentration / maxScale) * 100;

  const handleGasChange = useCallback((gasKey) => {
    setSelectedGas(gasKey);
    setConcentration(0);
    setShowGasMenu(false);
  }, []);

  const lelPercent10 = gas.lel * 0.1;
  const lelPercent20 = gas.lel * 0.2;

  const scaleMarks = useMemo(() => {
    const marks = [];
    const step = maxScale <= 10 ? 1 : maxScale <= 30 ? 5 : maxScale <= 50 ? 10 : 20;
    for (let i = 0; i <= maxScale; i += step) {
      marks.push(i);
    }
    if (!marks.includes(maxScale)) marks.push(maxScale);
    return marks;
  }, [maxScale]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #030712 0%, #0c1222 40%, #111827 100%)",
      fontFamily: "'Rubik', 'SF Pro Display', -apple-system, sans-serif",
      color: "#f1f5f9",
      direction: "rtl",
      padding: "0",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes explosivePulse {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.7), 0 0 60px rgba(239,68,68,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scaleY(0.95); }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes warningFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
        }

        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 52px;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 10;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 52px;
          background: transparent;
          border-radius: 16px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 68px;
          background: #ffffff;
          border-radius: 4px;
          margin-top: -8px;
          box-shadow: 0 0 16px rgba(255,255,255,0.5), 0 0 32px rgba(255,255,255,0.2);
          transition: box-shadow 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 24px rgba(255,255,255,0.8), 0 0 48px rgba(255,255,255,0.3);
        }
        input[type=range]::-moz-range-thumb {
          width: 8px;
          height: 68px;
          background: #ffffff;
          border-radius: 4px;
          border: none;
          box-shadow: 0 0 16px rgba(255,255,255,0.5);
        }
        input[type=range]::-moz-range-track {
          height: 52px;
          background: transparent;
          border-radius: 16px;
        }

        .gas-btn {
          padding: 10px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          font-size: 14px;
          text-align: right;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .gas-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .gas-btn.active {
          background: rgba(59,130,246,0.15);
          border-color: rgba(59,130,246,0.4);
        }
      `}</style>

      {/* Background decorative elements */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-20%", right: "-10%", width: "500px", height: "500px",
          background: `radial-gradient(circle, ${zoneInfo.glow}15, transparent 70%)`,
          transition: "background 0.8s ease",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%", width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)",
        }} />
      </div>

      <div style={{
        maxWidth: 860, margin: "0 auto", padding: "20px 20px 40px",
        position: "relative", zIndex: 1,
        opacity: animateIn ? 1 : 0, transform: animateIn ? "none" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            animation: "fadeInUp 0.6s ease-out",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg, #ef4444, #f97316, #eab308)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
            }}>🔥</div>
            <div>
              <h1 style={{
                fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
              }}>סקאלת טווח נפיצות</h1>
              <p style={{
                fontSize: 13, color: "#64748b", fontWeight: 400, marginTop: 2,
                fontFamily: "'JetBrains Mono', monospace",
              }}>Flammability Range Scale</p>
            </div>
          </div>
        </div>

        {/* Gas Selector */}
        <div className="glass-card" style={{
          padding: 16, marginBottom: 16,
          animation: "fadeInUp 0.6s ease-out 0.1s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>בחירת גז</span>
            <button onClick={() => setShowGasMenu(!showGasMenu)} style={{
              padding: "6px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{showGasMenu ? "▲" : "▼"}</span>
              {gas.formula !== "—" && <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: gas.color,
              }}>{gas.formula}</span>}
              <span>{gas.name}</span>
            </button>
          </div>

          {showGasMenu && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6,
              animation: "slideDown 0.3s ease-out",
            }}>
              {Object.entries(GASES).map(([key, g]) => (
                <button key={key} className={`gas-btn ${key === selectedGas ? "active" : ""}`}
                  onClick={() => handleGasChange(key)}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: g.color,
                    boxShadow: key === selectedGas ? `0 0 8px ${g.color}` : "none",
                    flexShrink: 0,
                  }} />
                  <span style={{ flex: 1 }}>{g.name}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b",
                  }}>{g.formula}</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected gas info bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            marginTop: showGasMenu ? 12 : 0,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, flex: 1,
              padding: "10px 14px", borderRadius: 12,
              background: `linear-gradient(135deg, ${gas.color}12, ${gas.color}06)`,
              border: `1px solid ${gas.color}30`,
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%", background: gas.color,
                boxShadow: `0 0 10px ${gas.color}60`,
              }} />
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>{gas.description}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                padding: "8px 12px", borderRadius: 10, background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)", textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "#f87171", fontWeight: 600 }}>LEL</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {gas.lel}%
                </div>
              </div>
              <div style={{
                padding: "8px 12px", borderRadius: 10, background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.2)", textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>UEL</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {gas.uel}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom toggle */}
        <div style={{
          display: "flex", justifyContent: "flex-end", marginBottom: 8,
          animation: "fadeInUp 0.6s ease-out 0.15s both",
        }}>
          <button onClick={() => { setIsZoomed(!isZoomed); setConcentration(0); }} style={{
            padding: "6px 14px", borderRadius: 10, fontSize: 12,
            background: isZoomed ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isZoomed ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)"}`,
            color: isZoomed ? "#60a5fa" : "#94a3b8", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.3s",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{isZoomed ? "🔍" : "🔎"}</span>
            {isZoomed ? "תצוגה מלאה" : "זום לטווח נפיצות"}
          </button>
        </div>

        {/* Main Scale */}
        <div className="glass-card-bright" style={{
          padding: "24px 20px 16px", marginBottom: 16,
          animation: zone === "explosive" 
            ? "fadeInUp 0.6s ease-out 0.2s both, explosivePulse 2s ease-in-out infinite" 
            : "fadeInUp 0.6s ease-out 0.2s both",
        }}>
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
              0%
            </span>
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
              {maxScale}% vol
            </span>
          </div>

          {/* The scale bar */}
          <div style={{ position: "relative", height: 52, marginBottom: 4 }}>
            {/* Zone backgrounds */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: 16, overflow: "hidden", display: "flex",
            }}>
              {/* Safe zone: 0 to 10%LEL */}
              <div style={{
                width: `${lel10Pct}%`, background: "linear-gradient(90deg, #064e3b, #065f46)",
                transition: "width 0.5s ease",
              }} />
              {/* Caution: 10%LEL to 20%LEL */}
              <div style={{
                width: `${Math.max(lel20Pct - lel10Pct, 0)}%`,
                background: "linear-gradient(90deg, #713f12, #854d0e)",
                transition: "width 0.5s ease",
              }} />
              {/* Warning: 20%LEL to LEL */}
              <div style={{
                width: `${Math.max(lelPct - lel20Pct, 0)}%`,
                background: "linear-gradient(90deg, #9a3412, #c2410c)",
                transition: "width 0.5s ease",
              }} />
              {/* Explosive: LEL to UEL */}
              <div style={{
                width: `${Math.max(uelPct - lelPct, 0)}%`,
                background: zone === "explosive"
                  ? "linear-gradient(90deg, #dc2626, #b91c1c, #991b1b, #dc2626)"
                  : "linear-gradient(90deg, #991b1b, #7f1d1d)",
                backgroundSize: zone === "explosive" ? "200% 100%" : "100% 100%",
                animation: zone === "explosive" ? "shimmer 2s linear infinite" : "none",
                transition: "width 0.5s ease",
              }} />
              {/* Too Rich: UEL to 100% */}
              <div style={{
                flex: 1,
                background: "linear-gradient(90deg, #4c1d95, #2e1065, #1e1b4b)",
                transition: "width 0.5s ease",
              }} />
            </div>

            {/* Marker lines */}
            {[
              { pct: lel10Pct, label: "10% LEL", color: "#fbbf24", value: lelPercent10 },
              { pct: lel20Pct, label: "20% LEL", color: "#fb923c", value: lelPercent20 },
              { pct: lelPct, label: "LEL", color: "#ef4444", value: gas.lel, bold: true },
              { pct: uelPct, label: "UEL", color: "#a78bfa", value: gas.uel, bold: true },
            ].filter(m => m.pct > 0 && m.pct < 100).map((marker, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${marker.pct}%`,
                top: 0, bottom: 0,
                width: marker.bold ? 3 : 2,
                background: marker.color,
                opacity: 0.8,
                zIndex: 5,
                transition: "left 0.5s ease",
              }}>
                <div style={{
                  position: "absolute",
                  top: -22,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 9,
                  fontWeight: 700,
                  color: marker.color,
                  whiteSpace: "nowrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: `0 0 8px ${marker.color}60`,
                }}>
                  {marker.label}
                </div>
              </div>
            ))}

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={maxScale}
              step={maxScale / 1000}
              value={concentration}
              onChange={(e) => setConcentration(parseFloat(e.target.value))}
              style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: 52, direction: "ltr",
              }}
            />

            {/* Current value indicator below slider */}
            {concentration > 0 && (
              <div style={{
                position: "absolute",
                left: `${sliderPct}%`,
                bottom: -28,
                transform: "translateX(-50%)",
                fontSize: 11,
                fontWeight: 600,
                color: zoneInfo.glow,
                whiteSpace: "nowrap",
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 8px ${zoneInfo.glow}80`,
                transition: "color 0.3s, text-shadow 0.3s",
                zIndex: 15,
              }}>
                {concentration < 1 ? `${(concentration * 10000).toFixed(0)} ppm` : `${concentration.toFixed(2)}%`}
              </div>
            )}
          </div>

          {/* Scale ticks */}
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 32,
            direction: "ltr", padding: "0 2px",
          }}>
            {scaleMarks.map((mark, i) => (
              <div key={i} style={{
                fontSize: 9, color: "#475569",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {mark}%
              </div>
            ))}
          </div>

          {/* ppm scale below */}
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 2,
            direction: "ltr", padding: "0 2px",
          }}>
            {scaleMarks.map((mark, i) => (
              <div key={i} style={{
                fontSize: 8, color: "#334155",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {mark * 10000 >= 1000000 ? `${(mark * 10000 / 1000000).toFixed(1)}M` :
                  mark * 10000 >= 1000 ? `${(mark * 10000 / 1000).toFixed(0)}K` :
                    `${mark * 10000}`}
                <span style={{ fontSize: 7 }}> ppm</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Legend Bar */}
        <div style={{
          display: "flex", gap: 3, marginBottom: 16, borderRadius: 12, overflow: "hidden",
          animation: "fadeInUp 0.6s ease-out 0.25s both", height: 28, direction: "ltr",
        }}>
          {[
            { zone: "safe", label: "בטוח", width: `${lel10Pct}%` },
            { zone: "caution", label: "10% LEL", width: `${lel20Pct - lel10Pct}%` },
            { zone: "warning", label: "אזהרה", width: `${lelPct - lel20Pct}%` },
            { zone: "explosive", label: "נפיץ!", width: `${uelPct - lelPct}%` },
            { zone: "rich", label: "עשיר", width: `${100 - uelPct}%` },
          ].map((z, i) => (
            <div key={i} style={{
              width: z.width, background: ZONE_COLORS[z.zone].bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.9)",
              overflow: "hidden", whiteSpace: "nowrap",
              borderRadius: i === 0 ? "8px 0 0 8px" : i === 4 ? "0 8px 8px 0" : 0,
              transition: "all 0.5s ease",
            }}>
              {parseFloat(z.width) > 8 ? z.label : ""}
            </div>
          ))}
        </div>

        {/* Status Card */}
        <div className="glass-card-bright" style={{
          padding: 20, marginBottom: 16,
          animation: "fadeInUp 0.6s ease-out 0.3s both",
          borderColor: `${zoneInfo.glow}25`,
          transition: "border-color 0.5s ease",
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Zone indicator */}
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: `linear-gradient(135deg, ${zoneInfo.bg}40, ${zoneInfo.bg}20)`,
              border: `2px solid ${zoneInfo.glow}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, flexShrink: 0,
              boxShadow: `0 0 20px ${zoneInfo.glow}20`,
              ...(zone === "explosive" ? { animation: "breathe 1.5s ease-in-out infinite" } : {}),
            }}>
              {zoneInfo.icon}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 20, fontWeight: 800, color: zoneInfo.glow,
                  textShadow: `0 0 20px ${zoneInfo.glow}40`,
                  ...(zone === "explosive" ? { animation: "warningFlash 1s ease-in-out infinite" } : {}),
                }}>{zoneInfo.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "2px 8px", borderRadius: 6,
                  background: "rgba(255,255,255,0.05)",
                }}>{zoneInfo.labelEn}</span>
              </div>

              <div style={{
                fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                color: "#f1f5f9", marginBottom: 4, lineHeight: 1,
              }}>
                {formatConcentration(concentration)}
              </div>

              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                {zone === "safe" && "ריכוז נמוך — אין סכנת התלקחות. המשך ניטור."}
                {zone === "caution" && "חצית סף 10% LEL — התראה ראשונה בגלאי גזים. חקור מקור."}
                {zone === "warning" && "חצית סף 20% LEL — התראת פינוי! הפעל אוורור, סגור מקורות הצתה."}
                {zone === "preLel" && "מתקרב לגבול התחתון של הנפיצות! פנה מיידית וטפל ממרחק."}
                {zone === "explosive" && "⚠ אתה בטווח הנפיצות! סכנת חיים מיידית — כל ניצוץ יגרום לפיצוץ!"}
                {zone === "rich" && "מעל גבול הנפיצות העליון. עדיין מסוכן — תנאים עלולים להשתנות!"}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8, marginTop: 16,
          }}>
            {[
              { label: "% מ-LEL", value: gas.lel > 0 ? `${((concentration / gas.lel) * 100).toFixed(1)}%` : "—", color: concentration >= gas.lel ? "#ef4444" : "#94a3b8" },
              { label: "ריכוז ב-ppm", value: `${(concentration * 10000).toFixed(0)}`, color: "#60a5fa" },
              { label: "ריכוז ב-% vol", value: `${concentration.toFixed(3)}%`, color: "#34d399" },
              { label: "מרחק מ-LEL", value: concentration < gas.lel ? `${(gas.lel - concentration).toFixed(2)}%` : concentration <= gas.uel ? "בטווח!" : `+${(concentration - gas.uel).toFixed(2)}%`, color: concentration >= gas.lel && concentration <= gas.uel ? "#ef4444" : "#a78bfa" },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 12,
                background: "rgba(0,0,0,0.2)", textAlign: "center",
              }}>
                <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{stat.label}</div>
                <div style={{
                  fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  color: stat.color, transition: "color 0.3s",
                }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Legend */}
        <div className="glass-card" style={{
          padding: 18, marginBottom: 16,
          animation: "fadeInUp 0.6s ease-out 0.35s both",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
            מקרא אזורים
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { color: "#059669", label: "בטוח", desc: `0 — ${(gas.lel * 0.1).toFixed(2)}% vol (10% LEL)`, descEn: "Below 10% LEL — safe, continue monitoring" },
              { color: "#d97706", label: "זהירות", desc: `${(gas.lel * 0.1).toFixed(2)}% — ${(gas.lel * 0.2).toFixed(2)}% vol`, descEn: "10-20% LEL — first alarm threshold" },
              { color: "#ea580c", label: "אזהרה", desc: `${(gas.lel * 0.2).toFixed(2)}% — ${gas.lel}% vol (LEL)`, descEn: "20% LEL to LEL — evacuation zone" },
              { color: "#dc2626", label: "טווח נפיצות", desc: `${gas.lel}% — ${gas.uel}% vol`, descEn: "LEL to UEL — explosive atmosphere!" },
              { color: "#7c3aed", label: "עשיר מדי", desc: `${gas.uel}% — 100% vol`, descEn: "Above UEL — too rich to ignite" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 5, background: item.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${item.color}40`,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginRight: 8 }}> — {item.desc}</span>
                  <div style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.descEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detector Alarms Reference */}
        <div className="glass-card" style={{
          padding: 18, marginBottom: 16,
          animation: "fadeInUp 0.6s ease-out 0.4s both",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
            🔔 סיפי התראה בגלאי גזים
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{
              padding: 12, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.03))",
              border: "1px solid rgba(251,191,36,0.15)",
            }}>
              <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>
                התראה ראשונה — 10% LEL
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                color: "#fbbf24",
              }}>
                {(gas.lel * 0.1).toFixed(2)}% vol
              </div>
              <div style={{ fontSize: 10, color: "#92710a" }}>
                {(gas.lel * 0.1 * 10000).toFixed(0)} ppm
              </div>
            </div>
            <div style={{
              padding: 12, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.03))",
              border: "1px solid rgba(249,115,22,0.15)",
            }}>
              <div style={{ fontSize: 11, color: "#fb923c", fontWeight: 700, marginBottom: 4 }}>
                התראת פינוי — 20% LEL
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                color: "#fb923c",
              }}>
                {(gas.lel * 0.2).toFixed(2)}% vol
              </div>
              <div style={{ fontSize: 10, color: "#9a3412" }}>
                {(gas.lel * 0.2 * 10000).toFixed(0)} ppm
              </div>
            </div>
          </div>
        </div>

        {/* Quick Gas Comparison */}
        <div className="glass-card" style={{
          padding: 18, marginBottom: 20,
          animation: "fadeInUp 0.6s ease-out 0.45s both",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
            📊 השוואת טווחי נפיצות
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(GASES).filter(([k]) => k !== "general").map(([key, g]) => {
              const isSelected = key === selectedGas;
              return (
                <div key={key} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: isSelected ? 1 : 0.6,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }} onClick={() => handleGasChange(key)}>
                  <span style={{
                    width: 55, fontSize: 10, fontWeight: 600, color: g.color,
                    fontFamily: "'JetBrains Mono', monospace", textAlign: "left",
                  }}>{g.formula}</span>
                  <div style={{
                    flex: 1, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.03)",
                    position: "relative", overflow: "hidden", direction: "ltr",
                  }}>
                    <div style={{
                      position: "absolute",
                      left: `${g.lel}%`,
                      width: `${Math.min(g.uel - g.lel, 100 - g.lel)}%`,
                      top: 0, bottom: 0,
                      background: `linear-gradient(90deg, ${g.color}80, ${g.color}40)`,
                      borderRadius: 4,
                      transition: "all 0.3s",
                      border: isSelected ? `1px solid ${g.color}` : "none",
                    }} />
                  </div>
                  <span style={{
                    width: 75, fontSize: 9, color: "#64748b", textAlign: "left",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {g.lel}–{g.uel}%
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 6,
            fontSize: 8, color: "#334155", fontFamily: "'JetBrains Mono', monospace",
            direction: "ltr",
          }}>
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "16px 0",
          animation: "fadeInUp 0.6s ease-out 0.5s both",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: 14 }}>🧑‍🚒</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              פותח ע&quot;י <span style={{ color: "#94a3b8", fontWeight: 600 }}>רועי צוקרמן</span>
            </span>
          </div>
          <div style={{
            fontSize: 10, color: "#334155", marginTop: 8,
          }}>
            כלי חינוכי — אין להסתמך עליו כתחליף לגלאי גזים מקצועיים
          </div>
        </div>
      </div>
    </div>
  );
}
