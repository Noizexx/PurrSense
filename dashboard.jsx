
// Dashboard Gatto - Complete MVP
// React + TypeScript-style JSX, Chart.js, Tailwind CDN
// Seed data: Micia, ~5 months, 2.9kg, indoor kitten

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_CAT = {
  id: "micia-001",
  name: "Micia",
  birthDate: "2024-10-10",
  sex: "unknown",
  breed: "unknown",
  lifestyle: "indoor",
  sterilized: "unknown",
  microchip: "",
  mainFood: "Advance Active Defense Kitten",
  foodKcalPerKg: 3800,
  planDryGrams: 60,
  planMealsPerDay: 3,
  planWetPerWeek: 1,
  photo: null,
  notes: "Molto giocosa, alta attività. Fontanella per l'acqua.",
};

const generateDates = (days) => {
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().split("T")[0]);
  }
  return arr;
};

const SEED_LOGS = generateDates(30).map((date, i) => ({
  id: `log-${i}`,
  date,
  weight: +(2.7 + i * 0.007 + (Math.random() - 0.5) * 0.05).toFixed(2),
  bcs: i < 10 ? 4 : i < 20 ? 4 : 5,
  mcs: "normal",
  dryGrams: 55 + Math.floor(Math.random() * 10),
  wetGrams: i % 7 === 0 ? 85 : 0,
  meals: 3,
  snackKcal: Math.random() > 0.7 ? 20 : 0,
  waterMl: 150 + Math.floor(Math.random() * 80),
  playMinutes: 20 + Math.floor(Math.random() * 40),
  groomingSessions: Math.floor(Math.random() * 3),
  shedding: Math.floor(Math.random() * 3),
  fecesNotes: "",
  vomiting: false,
  diarrhea: false,
  behaviorNotes: "",
}));

const SEED_PREVENTION = [
  { id: "v1", type: "vaccine", name: "Trivalente (FHV/FCV/FPV) 1a dose", date: "2025-01-15", nextDate: "2025-02-12", notes: "Core vaccine" },
  { id: "v2", type: "vaccine", name: "Trivalente (FHV/FCV/FPV) 2a dose", date: "2025-02-12", nextDate: "2025-03-12", notes: "Core vaccine" },
  { id: "v3", type: "vaccine", name: "Trivalente (FHV/FCV/FPV) 3a dose", date: "2025-03-12", nextDate: "2026-03-12", notes: "Booster annuale" },
  { id: "p1", type: "antiparasitic", name: "Antiparassitario interno (ESCCAP)", date: "2025-02-01", nextDate: "2025-05-01", notes: "Endoparassiti" },
  { id: "p2", type: "antiparasitic", name: "Antiparassitario esterno (pulci/zecche)", date: "2025-03-01", nextDate: "2025-04-01", notes: "Ectoparassiti mensile" },
  { id: "s1", type: "sterilization", name: "Sterilizzazione (raccomandata ~6 mesi)", date: null, nextDate: "2025-04-10", notes: "Da concordare col vet" },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const calcAge = (birthDate) => {
  if (!birthDate) return "N/D";
  const b = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (months < 12) return `${months} mesi`;
  return `${Math.floor(months / 12)} anni ${months % 12} mesi`;
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/D";
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── ALERT ENGINE ─────────────────────────────────────────────────────────────
const generateAlerts = (cat, logs, prevention) => {
  const alerts = [];
  if (!logs.length) return alerts;

  const recent = logs.slice(-7);
  const last = logs[logs.length - 1];

  // BCS alerts
  if (last.bcs >= 8) alerts.push({ level: "hard", msg: "BCS ≥ 8: condizione obesità. Contatta il veterinario.", icon: "🚨" });
  else if (last.bcs >= 6) alerts.push({ level: "soft", msg: "BCS ≥ 6: tendenza sovrappeso. Monitora l'alimentazione.", icon: "⚠️" });

  // Peso trend
  if (recent.length >= 3) {
    const first = recent[0].weight;
    const lastW = recent[recent.length - 1].weight;
    const change = ((lastW - first) / first) * 100;
    if (Math.abs(change) > 5) alerts.push({ level: "soft", msg: `Variazione peso >5% in 7gg (${change.toFixed(1)}%). Da monitorare.`, icon: "📊" });
  }

  // Vomiting
  const vomitDays = recent.filter(l => l.vomiting).length;
  if (vomitDays >= 2) alerts.push({ level: "hard", msg: `Vomito registrato ${vomitDays} volte negli ultimi 7 giorni. Contatta il veterinario.`, icon: "🚨" });

  // Diarrhea
  const diarrheaDays = recent.filter(l => l.diarrhea).length;
  if (diarrheaDays >= 2) alerts.push({ level: "hard", msg: `Diarrea registrata ${diarrheaDays} volte. Contatta il veterinario.`, icon: "🚨" });

  // Prevention due
  prevention.forEach(p => {
    const d = daysUntil(p.nextDate);
    if (d !== null && d <= 7 && d >= 0) alerts.push({ level: "soft", msg: `Scadenza vicina: ${p.name} tra ${d} giorni.`, icon: "📅" });
    if (d !== null && d < 0) alerts.push({ level: "hard", msg: `SCADUTO: ${p.name} (${formatDate(p.nextDate)}). Contatta il veterinario.`, icon: "⏰" });
  });

  return alerts;
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const Badge = ({ children, color = "amber" }) => {
  const colors = {
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-sky-100 text-sky-800 border-sky-200",
    purple: "bg-violet-100 text-violet-800 border-violet-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", onClick }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-amber-100 p-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const StatCard = ({ label, value, unit, sub, icon, color = "amber" }) => {
  const accents = { amber: "text-amber-500", emerald: "text-emerald-500", sky: "text-sky-500", violet: "text-violet-500", rose: "text-rose-500" };
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
        <span>{icon}</span>{label}
      </div>
      <div className={`text-2xl font-bold ${accents[color]}`}>{value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span></div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </Card>
  );
};

const AlertBanner = ({ alert }) => (
  <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${alert.level === "hard" ? "bg-red-50 border border-red-200 text-red-800" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
    <span className="text-lg leading-none mt-0.5">{alert.icon}</span>
    <span>{alert.msg}</span>
  </div>
);

const FormField = ({ label, children, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}{required && <span className="text-rose-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition bg-white ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition resize-none ${className}`}
    rows={3}
    {...props}
  />
);

const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const variants = {
    primary: "bg-amber-400 hover:bg-amber-500 text-white font-semibold shadow-sm",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
    danger: "bg-red-500 hover:bg-red-600 text-white font-semibold",
    ghost: "hover:bg-gray-100 text-gray-600",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      className={`rounded-xl transition-all ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ─── PROFILE SECTION ─────────────────────────────────────────────────────────
const ProfileSection = ({ cat, onEdit }) => {
  const age = calcAge(cat.birthDate);
  const lastLog = SEED_LOGS[SEED_LOGS.length - 1];

  return (
    <Card className="flex items-start gap-4">
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-4xl overflow-hidden shadow-inner">
          {cat.photo ? <img src={cat.photo} alt={cat.name} className="w-full h-full object-cover" /> : "🐱"}
        </div>
        <button
          onClick={() => onEdit("photo")}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs shadow hover:bg-amber-500 transition"
        >📷</button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold text-gray-800">{cat.name}</h2>
          <Badge color="amber">🏠 Indoor</Badge>
          {cat.sterilized === "yes" && <Badge color="green">✂️ Sterilizzata</Badge>}
          {cat.sterilized === "no" && <Badge color="purple">🐾 Intera</Badge>}
          {cat.sterilized === "unknown" && <Badge color="gray">❓ Sterliz.</Badge>}
        </div>
        <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>🎂 {age}</span>
          <span>⚖️ {lastLog.weight} kg</span>
          {cat.breed !== "unknown" && <span>🐈 {cat.breed}</span>}
          {cat.sex !== "unknown" && <span>{cat.sex === "female" ? "♀" : "♂"} {cat.sex}</span>}
        </div>
        <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>🍽️ {cat.mainFood}</span>
          <span>📊 {cat.planDryGrams}g/die · {cat.planMealsPerDay} pasti · umido {cat.planWetPerWeek}×/sett.</span>
        </div>
        {cat.notes && <div className="mt-1 text-xs text-gray-400 italic truncate">{cat.notes}</div>}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onEdit("profile")} className="flex-shrink-0">✏️</Button>
    </Card>
  );
};

// ─── TODAY FORM ───────────────────────────────────────────────────────────────
const TodayForm = ({ onSave, existingLog, cat }) => {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(existingLog || {
    date: today,
    weight: "",
    bcs: 4,
    mcs: "normal",
    dryGrams: cat.planDryGrams,
    wetGrams: 0,
    meals: cat.planMealsPerDay,
    snackKcal: 0,
    waterMl: "",
    playMinutes: "",
    groomingSessions: 1,
    shedding: 1,
    fecesNotes: "",
    vomiting: false,
    diarrhea: false,
    behaviorNotes: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: `log-${Date.now()}` });
  };

  return (
    <Card>
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-lg">📝</span> Log di Oggi
        <Badge color="blue">{formatDate(today)}</Badge>
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FormField label="Peso (kg)">
            <Input type="number" step="0.01" min="0.5" max="15" placeholder="es. 2.9" value={form.weight} onChange={e => set("weight", e.target.value)} />
          </FormField>
          <FormField label="BCS (1–9)">
            <Select value={form.bcs} onChange={e => set("bcs", +e.target.value)}>
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} {n===4?"(ideale)":n===5?"(ottimale)":n>=8?"(obeso)":n>=6?"(sovrappeso)":""}</option>)}
            </Select>
          </FormField>
          <FormField label="MCS (pelo)">
            <Select value={form.mcs} onChange={e => set("mcs", e.target.value)}>
              <option value="normal">Normale</option>
              <option value="mild">Lieve perdita</option>
              <option value="moderate">Moderata</option>
              <option value="severe">Severa</option>
            </Select>
          </FormField>
          <FormField label="Shedding (0–5)">
            <Select value={form.shedding} onChange={e => set("shedding", +e.target.value)}>
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FormField label="Secco (g)">
            <Input type="number" min="0" max="500" value={form.dryGrams} onChange={e => set("dryGrams", +e.target.value)} />
          </FormField>
          <FormField label="Umido (g)">
            <Input type="number" min="0" max="500" value={form.wetGrams} onChange={e => set("wetGrams", +e.target.value)} />
          </FormField>
          <FormField label="Pasti (#)">
            <Input type="number" min="1" max="10" value={form.meals} onChange={e => set("meals", +e.target.value)} />
          </FormField>
          <FormField label="Snack (kcal)">
            <Input type="number" min="0" max="200" value={form.snackKcal} onChange={e => set("snackKcal", +e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FormField label="Acqua (ml)">
            <Input type="number" min="0" max="1000" placeholder="es. 200" value={form.waterMl} onChange={e => set("waterMl", +e.target.value)} />
          </FormField>
          <FormField label="Gioco (min)">
            <Input type="number" min="0" max="480" placeholder="es. 30" value={form.playMinutes} onChange={e => set("playMinutes", +e.target.value)} />
          </FormField>
          <FormField label="Grooming (#)">
            <Input type="number" min="0" max="10" value={form.groomingSessions} onChange={e => set("groomingSessions", +e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Note feci/urine">
            <Input placeholder="es. normale, dura, sangue..." value={form.fecesNotes} onChange={e => set("fecesNotes", e.target.value)} />
          </FormField>
          <FormField label="Note comportamento">
            <Input placeholder="es. letargica, agitata..." value={form.behaviorNotes} onChange={e => set("behaviorNotes", e.target.value)} />
          </FormField>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={form.vomiting} onChange={e => set("vomiting", e.target.checked)} />
            <span className="text-sm text-gray-600">🤢 Vomito</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={form.diarrhea} onChange={e => set("diarrhea", e.target.checked)} />
            <span className="text-sm text-gray-600">💧 Diarrea</span>
          </label>
        </div>
        <Button type="submit" variant="primary" className="w-full">💾 Salva Log</Button>
      </form>
    </Card>
  );
};

// ─── CHARTS ───────────────────────────────────────────────────────────────────
const WeightChart = ({ logs }) => {
  const data = logs.slice(-30).map(l => ({ date: l.date.slice(5), weight: l.weight, bcs: l.bcs }));
  return (
    <Card>
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>📈</span> Peso & BCS (30 gg)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" domain={[1, 9]} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} dot={false} name="Peso (kg)" />
          <Line yAxisId="right" type="monotone" dataKey="bcs" stroke="#10b981" strokeWidth={2} dot={false} name="BCS (1-9)" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

const FoodChart = ({ logs }) => {
  const data = logs.slice(-14).map(l => ({ date: l.date.slice(5), secco: l.dryGrams, umido: l.wetGrams }));
  return (
    <Card>
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>🍽️</span> Alimentazione (14 gg)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="secco" stackId="a" fill="#f59e0b" name="Secco (g)" />
          <Bar dataKey="umido" stackId="a" fill="#fb923c" name="Umido (g)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const ActivityChart = ({ logs }) => {
  const data = logs.slice(-14).map(l => ({ date: l.date.slice(5), gioco: l.playMinutes, shedding: l.shedding * 10, acqua: l.waterMl / 5 }));
  return (
    <Card>
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>🎮</span> Attività & Salute (14 gg)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v, n) => [n === "Acqua (×5ml)" ? v*5 : n === "Shedding (×10)" ? v/10 : v, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="gioco" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Gioco (min)" />
          <Line type="monotone" dataKey="shedding" stroke="#ef4444" strokeWidth={2} dot={false} name="Shedding (×10)" />
          <Line type="monotone" dataKey="acqua" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Acqua (×5ml)" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── PREVENTION TIMELINE ──────────────────────────────────────────────────────
const PreventionTimeline = ({ items, onAdd }) => {
  const icons = { vaccine: "💉", antiparasitic: "🐛", sterilization: "✂️" };
  const colors = { vaccine: "blue", antiparasitic: "green", sterilization: "purple" };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-700 flex items-center gap-2"><span>🗓️</span> Timeline Prevenzione</h3>
        <Button variant="secondary" size="sm" onClick={onAdd}>+ Aggiungi</Button>
      </div>
      <div className="space-y-2">
        {items.sort((a, b) => (a.nextDate || "9999") > (b.nextDate || "9999") ? 1 : -1).map(item => {
          const d = daysUntil(item.nextDate);
          const isExpired = d !== null && d < 0;
          const isSoon = d !== null && d <= 7 && d >= 0;
          return (
            <div key={item.id} className={`flex items-center gap-3 p-2 rounded-xl ${isExpired ? "bg-red-50" : isSoon ? "bg-amber-50" : "bg-gray-50"}`}>
              <span className="text-xl">{icons[item.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 truncate">{item.name}</div>
                <div className="text-xs text-gray-400">
                  {item.date && <span>Fatto: {formatDate(item.date)} · </span>}
                  Prossimo: {formatDate(item.nextDate)}
                  {d !== null && <span className={`ml-1 font-semibold ${isExpired ? "text-red-500" : isSoon ? "text-amber-600" : "text-gray-400"}`}>
                    {isExpired ? ` (${-d}gg fa!)` : ` (tra ${d}gg)`}
                  </span>}
                </div>
              </div>
              <Badge color={isExpired ? "red" : isSoon ? "amber" : colors[item.type]}>
                {item.type === "vaccine" ? "Vaccino" : item.type === "antiparasitic" ? "Antipar." : "Steriliz."}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ─── LOG HISTORY ──────────────────────────────────────────────────────────────
const LogHistory = ({ logs, onDelete }) => {
  const [expanded, setExpanded] = useState(null);
  const recent = [...logs].reverse().slice(0, 10);

  return (
    <Card>
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>📋</span> Storico Log (ultimi 10)</h3>
      <div className="space-y-2">
        {recent.map(log => (
          <div key={log.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            >
              <span className="text-sm font-semibold text-gray-500 w-16 flex-shrink-0">{formatDate(log.date)}</span>
              <div className="flex gap-2 flex-wrap flex-1">
                {log.weight && <Badge color="amber">⚖️ {log.weight}kg</Badge>}
                <Badge color="green">BCS {log.bcs}</Badge>
                <Badge color="sky">🎮 {log.playMinutes}min</Badge>
                {log.vomiting && <Badge color="red">🤢</Badge>}
                {log.diarrhea && <Badge color="red">💧</Badge>}
              </div>
              <span className="text-gray-300 text-xs">{expanded === log.id ? "▲" : "▼"}</span>
            </div>
            {expanded === log.id && (
              <div className="px-3 pb-3 pt-1 bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                <span>🍽️ Secco: {log.dryGrams}g</span>
                <span>🥩 Umido: {log.wetGrams}g</span>
                <span>💧 Acqua: {log.waterMl}ml</span>
                <span>🐱 Grooming: {log.groomingSessions}</span>
                <span>🌿 MCS: {log.mcs}</span>
                <span>🔴 Shedding: {log.shedding}/5</span>
                <span>🤢 Vomito: {log.vomiting ? "Sì" : "No"}</span>
                <span>💩 Diarrea: {log.diarrhea ? "Sì" : "No"}</span>
                {log.fecesNotes && <span className="col-span-2">💩 Note: {log.fecesNotes}</span>}
                {log.behaviorNotes && <span className="col-span-2">💭 Comportamento: {log.behaviorNotes}</span>}
                <Button variant="danger" size="sm" className="col-span-2 sm:col-span-4 mt-2" onClick={() => onDelete(log.id)}>🗑️ Elimina</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── PROFILE EDITOR ───────────────────────────────────────────────────────────
const ProfileEditor = ({ cat, onSave, onClose }) => {
  const [form, setForm] = useState({ ...cat });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">✏️ Modifica Profilo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nome" required>
              <Input value={form.name} onChange={e => set("name", e.target.value)} />
            </FormField>
            <FormField label="Data di nascita">
              <Input type="date" value={form.birthDate} onChange={e => set("birthDate", e.target.value)} />
            </FormField>
            <FormField label="Sesso">
              <Select value={form.sex} onChange={e => set("sex", e.target.value)}>
                <option value="unknown">Sconosciuto</option>
                <option value="female">Femmina</option>
                <option value="male">Maschio</option>
              </Select>
            </FormField>
            <FormField label="Razza">
              <Input value={form.breed} onChange={e => set("breed", e.target.value)} placeholder="es. Europeo, Sconosciuto" />
            </FormField>
            <FormField label="Stile di vita">
              <Select value={form.lifestyle} onChange={e => set("lifestyle", e.target.value)}>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="mixed">Misto</option>
              </Select>
            </FormField>
            <FormField label="Sterilizzata">
              <Select value={form.sterilized} onChange={e => set("sterilized", e.target.value)}>
                <option value="unknown">Non noto</option>
                <option value="yes">Sì</option>
                <option value="no">No</option>
              </Select>
            </FormField>
            <FormField label="Microchip">
              <Input value={form.microchip} onChange={e => set("microchip", e.target.value)} placeholder="Numero microchip (opz.)" />
            </FormField>
          </div>
          <FormField label="Alimento principale">
            <Input value={form.mainFood} onChange={e => set("mainFood", e.target.value)} />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Secco g/die">
              <Input type="number" value={form.planDryGrams} onChange={e => set("planDryGrams", +e.target.value)} />
            </FormField>
            <FormField label="Pasti/die">
              <Input type="number" value={form.planMealsPerDay} onChange={e => set("planMealsPerDay", +e.target.value)} />
            </FormField>
            <FormField label="Umido/sett.">
              <Input type="number" value={form.planWetPerWeek} onChange={e => set("planWetPerWeek", +e.target.value)} />
            </FormField>
          </div>
          <FormField label="Note">
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} />
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={() => { onSave(form); onClose(); }}>💾 Salva</Button>
            <Button variant="secondary" onClick={onClose}>Annulla</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PREVENTION EDITOR ────────────────────────────────────────────────────────
const PreventionEditor = ({ onSave, onClose }) => {
  const [form, setForm] = useState({ type: "vaccine", name: "", date: "", nextDate: "", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">🗓️ Aggiungi Prevenzione</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <FormField label="Tipo">
            <Select value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="vaccine">💉 Vaccino</option>
              <option value="antiparasitic">🐛 Antiparassitario</option>
              <option value="sterilization">✂️ Sterilizzazione</option>
            </Select>
          </FormField>
          <FormField label="Nome" required>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="es. Trivalente FHV/FCV/FPV" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data esecuzione">
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </FormField>
            <FormField label="Prossima scadenza">
              <Input type="date" value={form.nextDate} onChange={e => set("nextDate", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Note">
            <Input value={form.notes} onChange={e => set("notes", e.target.value)} />
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={() => { onSave({ ...form, id: `p-${Date.now()}` }); onClose(); }}>💾 Salva</Button>
            <Button variant="secondary" onClick={onClose}>Annulla</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── EXPORT / SHARE ───────────────────────────────────────────────────────────
const ExportPanel = ({ cat, logs, prevention, onClose }) => {
  const exportJSON = () => {
    const data = { cat, logs, prevention, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${cat.name}-dashboard-${new Date().toISOString().split("T")[0]}.json`; a.click();
  };

  const exportCSV = () => {
    const headers = ["data","peso","bcs","mcs","secco_g","umido_g","pasti","snack_kcal","acqua_ml","gioco_min","grooming","shedding","vomito","diarrea","note_feci","note_comportamento"];
    const rows = logs.map(l => [l.date,l.weight,l.bcs,l.mcs,l.dryGrams,l.wetGrams,l.meals,l.snackKcal,l.waterMl,l.playMinutes,l.groomingSessions,l.shedding,l.vomiting?1:0,l.diarrhea?1:0,`"${l.fecesNotes}"`,`"${l.behaviorNotes}"`].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${cat.name}-logs-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  const shareToken = Math.random().toString(36).slice(2, 10).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">📤 Export & Condivisione</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={exportJSON} className="flex flex-col items-center gap-1 py-4">
              <span className="text-2xl">📄</span>
              <span>Export JSON</span>
              <span className="text-xs text-gray-400">Profilo + Log + Prevenzione</span>
            </Button>
            <Button variant="secondary" onClick={exportCSV} className="flex flex-col items-center gap-1 py-4">
              <span className="text-2xl">📊</span>
              <span>Export CSV</span>
              <span className="text-xs text-gray-400">Solo log giornalieri</span>
            </Button>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <div className="font-semibold text-amber-800 mb-1 text-sm">🔗 Link Vet-Share (30 giorni)</div>
            <div className="font-mono text-xs bg-white rounded-lg p-2 border border-amber-200 text-gray-600 break-all">
              https://app.local/share/{shareToken}
            </div>
            <div className="text-xs text-amber-600 mt-1">Token: {shareToken} · Scadenza: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("it-IT")} · Solo lettura</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
            📝 Il PDF "30 giorni" sarà disponibile nella versione con backend (Next.js). Il link condivisibile genera un accesso read-only con token monouso.
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DISCLAIMER ───────────────────────────────────────────────────────────────
const Disclaimer = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
    <strong>⚠️ Nota Importante:</strong> Questa app è uno strumento di monitoraggio personale e non sostituisce la visita veterinaria.
    I range indicati (BCS, MCS, peso, ecc.) sono orientativi e basati sulle linee guida WSAVA/AAHA/AAFP.
    Consulta sempre il tuo veterinario per valutazioni cliniche. In caso di sintomi preoccupanti, contatta il vet senza attendere.
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [cat, setCat] = useState(SEED_CAT);
  const [logs, setLogs] = useState(SEED_LOGS);
  const [prevention, setPrevention] = useState(SEED_PREVENTION);
  const [modal, setModal] = useState(null); // "profile" | "prevention" | "export"
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | charts | history | prevention

  const alerts = generateAlerts(cat, logs, prevention);
  const lastLog = logs[logs.length - 1];

  const handleSaveLog = (newLog) => {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === newLog.date);
      if (idx >= 0) { const next = [...prev]; next[idx] = newLog; return next; }
      return [...prev, newLog].sort((a, b) => a.date > b.date ? 1 : -1);
    });
  };

  const handleDeleteLog = (id) => {
    if (confirm("Eliminare questo log?")) setLogs(prev => prev.filter(l => l.id !== id));
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "charts", label: "Grafici", icon: "📊" },
    { id: "history", label: "Storico", icon: "📋" },
    { id: "prevention", label: "Prevenzione", icon: "💉" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-none">Dashboard Gatto</h1>
              <p className="text-xs text-gray-400 leading-none">Monitor salute & benessere</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setModal("export")}>📤</Button>
            <Button variant="primary" size="sm" onClick={() => setModal("profile")}>✏️ Profilo</Button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap
                ${activeTab === tab.id ? "bg-amber-400 text-white shadow-sm" : "text-gray-500 hover:bg-amber-50"}`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
          {alerts.length > 0 && (
            <span className="ml-auto flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center self-center">
              {alerts.length}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => <AlertBanner key={i} alert={a} />)}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            <ProfileSection cat={cat} onEdit={setModal} />
            {/* Quick stats */}
            {lastLog && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon="⚖️" label="Peso" value={lastLog.weight} unit="kg" sub={`BCS: ${lastLog.bcs}/9`} color="amber" />
                <StatCard icon="🍽️" label="Secco oggi" value={lastLog.dryGrams} unit="g" sub={`Target: ${cat.planDryGrams}g`} color="emerald" />
                <StatCard icon="🎮" label="Gioco" value={lastLog.playMinutes} unit="min" sub="Ieri" color="violet" />
                <StatCard icon="💧" label="Acqua" value={lastLog.waterMl || "–"} unit={lastLog.waterMl ? "ml" : ""} sub="Stimata" color="sky" />
              </div>
            )}
            <TodayForm onSave={handleSaveLog} cat={cat} existingLog={logs.find(l => l.date === new Date().toISOString().split("T")[0])} />
            <Disclaimer />
          </>
        )}

        {/* Charts Tab */}
        {activeTab === "charts" && (
          <>
            <WeightChart logs={logs} />
            <FoodChart logs={logs} />
            <ActivityChart logs={logs} />
            <Disclaimer />
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <>
            <LogHistory logs={logs} onDelete={handleDeleteLog} />
            <Disclaimer />
          </>
        )}

        {/* Prevention Tab */}
        {activeTab === "prevention" && (
          <>
            <PreventionTimeline items={prevention} onAdd={() => setModal("prevention")} />
            <Card>
              <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><span>📚</span> Linee Guida di Riferimento</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div>💉 <strong>Vaccini (AAHA/AAFP 2020):</strong> Serie gattini q2–4 sett. fino 16–20 settimane; core: FHV-1, FCV, FPV. Booster annuale o triennale.</div>
                <div>🐛 <strong>Antiparassitari (ESCCAP IT):</strong> Endoparassiti: trattamento regolare (ogni 3 mesi per gatti indoor). Ectoparassiti: mensile se a rischio.</div>
                <div>✂️ <strong>Sterilizzazione:</strong> Raccomandata intorno ai 5–6 mesi (da confermare col veterinario).</div>
                <div>📊 <strong>Peso/BCS/MCS (WSAVA):</strong> BCS 4–5/9 ideale. MCS "normal". Foto dorsale e laterale ogni 4–8 settimane per monitoraggio condizione corporea.</div>
                <div>💧 <strong>Idratazione (Cornell):</strong> Fabbisogno ~50ml/kg/die. Fontanella consigliata. Segni disidratazione: cute che non torna elastica, gengive secche.</div>
              </div>
            </Card>
            <Disclaimer />
          </>
        )}
      </main>

      {/* Modals */}
      {modal === "profile" && <ProfileEditor cat={cat} onSave={setCat} onClose={() => setModal(null)} />}
      {modal === "prevention" && <PreventionEditor onSave={(item) => setPrevention(p => [...p, item])} onClose={() => setModal(null)} />}
      {modal === "export" && <ExportPanel cat={cat} logs={logs} prevention={prevention} onClose={() => setModal(null)} />}

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>Dashboard Gatto MVP · Dati in memoria locale · Non è uno strumento medico</p>
        <p className="mt-1">Fonti: WSAVA, AAHA/AAFP 2020, AAFP/ISFM, ESCCAP IT, Cornell Feline Health Center</p>
      </footer>
    </div>
  );
}
