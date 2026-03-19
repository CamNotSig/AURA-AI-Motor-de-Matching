import { useState, useEffect } from "react";

const ORANGE = "#E87722";
const DARK = "#0d0d0d";
const CARD = "#161616";
const CARD2 = "#1e1e1e";
const BORDER = "#2a2a2a";
const MUTED = "#6b7280";
const TEXT = "#f0f0f0";
const TEXT2 = "#a1a1aa";

const inversores = [
  { id: 1, nombre: "Kaszek Ventures", logo: "K", color: "#1d6fa4", sectores: ["Fintech", "SaaS", "Healthtech"], etapas: ["Seed", "Serie A"], ticketMin: 500000, ticketMax: 5000000, geografia: ["LATAM"], equipoMinimo: 3, mrr_minimo: 10000, traccion: "media", impacto: false },
  { id: 2, nombre: "Monashees", logo: "M", color: "#7c3aed", sectores: ["Edtech", "Fintech", "Marketplace"], etapas: ["Pre-seed", "Seed"], ticketMin: 100000, ticketMax: 2000000, geografia: ["Brasil", "LATAM"], equipoMinimo: 2, mrr_minimo: 5000, traccion: "baja", impacto: false },
  { id: 3, nombre: "Unreasonable Capital", logo: "U", color: "#047857", sectores: ["Agritech", "Cleantech", "Healthtech", "Edtech"], etapas: ["Seed", "Serie A"], ticketMin: 250000, ticketMax: 3000000, geografia: ["Global"], equipoMinimo: 2, mrr_minimo: 0, traccion: "baja", impacto: true },
  { id: 4, nombre: "Acumen Fund", logo: "A", color: "#b45309", sectores: ["Healthtech", "Agritech", "Educación"], etapas: ["Pre-seed", "Seed"], ticketMin: 50000, ticketMax: 1000000, geografia: ["Global", "LATAM"], equipoMinimo: 1, mrr_minimo: 0, traccion: "baja", impacto: true },
  { id: 5, nombre: "Andreessen Horowitz", logo: "a16z", color: "#334155", sectores: ["SaaS", "AI", "Fintech", "Crypto"], etapas: ["Serie A", "Serie B"], ticketMin: 5000000, ticketMax: 50000000, geografia: ["USA", "Global"], equipoMinimo: 5, mrr_minimo: 100000, traccion: "alta", impacto: false },
];

const sectoresOpciones = ["Fintech", "SaaS", "Healthtech", "Edtech", "Agritech", "Cleantech", "Marketplace", "AI", "Crypto", "Educación"];
const etapasOpciones = ["Pre-seed", "Seed", "Serie A", "Serie B"];
const geografiaOpciones = ["Colombia", "LATAM", "Brasil", "USA", "Global"];
const traccionOpciones = ["baja", "media", "alta"];

function calcularMatch(startup, inversor) {
  let score = 0, total = 0;
  total += 25; if (inversor.sectores.includes(startup.sector)) score += 25;
  total += 20; if (inversor.etapas.includes(startup.etapa)) score += 20;
  total += 20;
  const t = parseInt(startup.ticket);
  if (t >= inversor.ticketMin && t <= inversor.ticketMax) score += 20;
  else if (t >= inversor.ticketMin * 0.7 && t <= inversor.ticketMax * 1.3) score += 10;
  total += 15;
  if (inversor.geografia.includes("Global") || inversor.geografia.includes(startup.geografia)) score += 15;
  else if (inversor.geografia.includes("LATAM") && ["Colombia", "Brasil", "LATAM"].includes(startup.geografia)) score += 10;
  total += 10;
  const eq = parseInt(startup.equipo);
  if (eq >= inversor.equipoMinimo) score += 10;
  else if (eq >= inversor.equipoMinimo - 1) score += 5;
  total += 10;
  const mrr = parseInt(startup.mrr);
  if (mrr >= inversor.mrr_minimo) score += 10;
  else if (mrr >= inversor.mrr_minimo * 0.6) score += 5;
  if (startup.impacto && inversor.impacto) score += 5;
  return Math.min(100, Math.round((score / total) * 100));
}

const fmt = (n) => n >= 1000000 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1000).toFixed(0)}K`;

function ScoreRing({ pct }) {
  const r = 26, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#22c55e" : pct >= 50 ? ORANGE : "#ef4444";
  return (
    <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={32} cy={32} r={r} fill="none" stroke="#2a2a2a" strokeWidth={5} />
      <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x={32} y={36} textAnchor="middle" fill={color} fontSize={13} fontWeight={800}
        style={{ transform: "rotate(90deg)", transformOrigin: "32px 32px" }}>
        {pct}%
      </text>
    </svg>
  );
}

function Tag({ children, accent }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
      background: accent ? ORANGE + "22" : "#ffffff0a",
      color: accent ? ORANGE : TEXT2,
      border: `1px solid ${accent ? ORANGE + "55" : BORDER}`,
      letterSpacing: 0.3,
    }}>{children}</span>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "#111", border: `1px solid ${BORDER}`, borderRadius: 8,
  padding: "10px 12px", fontSize: 14, color: TEXT, outline: "none",
  transition: "border-color 0.2s", width: "100%", boxSizing: "border-box",
};

export default function App() {
  const [startup, setStartup] = useState({
    nombre: "", sector: "Fintech", etapa: "Seed",
    ticket: "500000", mrr: "15000", equipo: "4",
    geografia: "LATAM", traccion: "media", impacto: false,
  });
  const [mostrar, setMostrar] = useState(false);
  const [animated, setAnimated] = useState(false);

  const set = (k, v) => setStartup(s => ({ ...s, [k]: v }));

  const resultados = inversores
    .map(inv => ({ ...inv, score: calcularMatch(startup, inv) }))
    .sort((a, b) => b.score - a.score);

  const handleCalc = () => {
    setMostrar(true);
    setAnimated(false);
    setTimeout(() => setAnimated(true), 50);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: DARK, minHeight: "100vh", color: TEXT, padding: "32px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16,
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "10px 20px" }}>
            {/* SVG Logo mark */}
            <svg width={32} height={32} viewBox="0 0 40 40">
              <polygon points="20,4 34,32 6,32" fill="#555" />
              <circle cx={20} cy={10} r={3} fill={ORANGE} />
              <circle cx={10} cy={28} r={3} fill={ORANGE} />
              <circle cx={30} cy={28} r={3} fill={ORANGE} />
              <line x1={20} y1={10} x2={10} y2={28} stroke={ORANGE} strokeWidth={1.5} />
              <line x1={20} y1={10} x2={30} y2={28} stroke={ORANGE} strokeWidth={1.5} />
              <line x1={10} y1={28} x2={30} y2={28} stroke={ORANGE} strokeWidth={1.5} />
              <ellipse cx={20} cy={22} rx={16} ry={8} fill="none" stroke={ORANGE} strokeWidth={1.5}
                transform="rotate(-20, 20, 22)" />
            </svg>
            <span style={{ fontWeight: 900, fontSize: 20, color: TEXT, letterSpacing: 2 }}>AURA</span>
            <span style={{ fontWeight: 300, fontSize: 20, color: ORANGE, letterSpacing: 2 }}>AI</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: TEXT, letterSpacing: -0.5 }}>
            Motor de Matching <span style={{ color: ORANGE }}>Inversor–Startup</span>
          </h1>
          <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>
            Ingresa el perfil de tu startup y descubre los inversores más compatibles
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mostrar ? "1fr 1fr" : "560px", justifyContent: "center", gap: 20 }}>

          {/* Form */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 20, background: ORANGE, borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Perfil de la Startup</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Nombre">
                <input style={inputStyle} value={startup.nombre}
                  onChange={e => set("nombre", e.target.value)} placeholder="Ej: AgriSense SAS" />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Sector">
                  <select style={inputStyle} value={startup.sector} onChange={e => set("sector", e.target.value)}>
                    {sectoresOpciones.map(s => <option key={s} style={{ background: "#111" }}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Etapa">
                  <select style={inputStyle} value={startup.etapa} onChange={e => set("etapa", e.target.value)}>
                    {etapasOpciones.map(s => <option key={s} style={{ background: "#111" }}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Ticket buscado (USD)">
                  <input style={inputStyle} type="number" value={startup.ticket}
                    onChange={e => set("ticket", e.target.value)} placeholder="500000" />
                </Field>
                <Field label="MRR actual (USD)">
                  <input style={inputStyle} type="number" value={startup.mrr}
                    onChange={e => set("mrr", e.target.value)} placeholder="15000" />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Equipo">
                  <input style={inputStyle} type="number" value={startup.equipo}
                    onChange={e => set("equipo", e.target.value)} placeholder="4" />
                </Field>
                <Field label="Geografía">
                  <select style={inputStyle} value={startup.geografia} onChange={e => set("geografia", e.target.value)}>
                    {geografiaOpciones.map(g => <option key={g} style={{ background: "#111" }}>{g}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
                <Field label="Tracción">
                  <select style={inputStyle} value={startup.traccion} onChange={e => set("traccion", e.target.value)}>
                    {traccionOpciones.map(t => <option key={t} style={{ background: "#111" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </Field>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 2 }}>
                  <div onClick={() => set("impacto", !startup.impacto)}
                    style={{ width: 42, height: 24, borderRadius: 999, background: startup.impacto ? ORANGE : "#2a2a2a",
                      position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: startup.impacto ? 20 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 13, color: startup.impacto ? ORANGE : TEXT2, fontWeight: 600, transition: "color 0.3s" }}>
                    Startup de impacto
                  </span>
                </div>
              </div>
            </div>

            <button onClick={handleCalc} style={{
              marginTop: 24, width: "100%", background: ORANGE, color: "#fff",
              border: "none", borderRadius: 10, padding: "13px 0", fontSize: 15, fontWeight: 800,
              cursor: "pointer", letterSpacing: 0.5, transition: "opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => e.target.style.opacity = 0.88}
              onMouseLeave={e => e.target.style.opacity = 1}>
              🔍 Calcular Matches
            </button>
          </div>

          {/* Results */}
          {mostrar && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 4, height: 20, background: ORANGE, borderRadius: 2 }} />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>
                  Inversores compatibles{startup.nombre ? ` · ${startup.nombre}` : ""}
                </h2>
              </div>

              {resultados.map((inv, i) => {
                const pct = inv.score;
                const isTop = i === 0;
                return (
                  <div key={inv.id} style={{
                    background: isTop ? `${ORANGE}0d` : CARD2,
                    border: `1px solid ${isTop ? ORANGE + "55" : BORDER}`,
                    borderRadius: 14, padding: "16px 18px",
                    opacity: animated ? 1 : 0,
                    transform: animated ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.4s ${i * 0.08}s, transform 0.4s ${i * 0.08}s`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ background: inv.color, color: "#fff", borderRadius: 10, width: 38, height: 38,
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                        {inv.logo}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: TEXT }}>{inv.nombre}</span>
                          {isTop && <Tag accent>⭐ Top Match</Tag>}
                          {inv.impacto && <Tag>🌱 Impacto</Tag>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          <Tag>{inv.etapas.join(" · ")}</Tag>
                          <Tag>{fmt(inv.ticketMin)} – {fmt(inv.ticketMax)}</Tag>
                          <Tag>{inv.geografia.join(", ")}</Tag>
                        </div>
                      </div>
                      <ScoreRing pct={pct} />
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 4, padding: "12px 16px", background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 12, display: "flex", gap: 18, justifyContent: "center" }}>
                {[["≥75%", "#22c55e", "Alto"], ["50–74%", ORANGE, "Medio"], ["<50%", "#ef4444", "Bajo"]].map(([r, c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 11, color: MUTED }}><b style={{ color: TEXT2 }}>{r}</b> {l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#333" }}>
          AURA AI · Motor de Matching v1.0
        </p>
      </div>
    </div>
  );
}