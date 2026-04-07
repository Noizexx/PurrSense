"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { calcAge, formatDate, daysUntil } from "@/lib/utils";
import type { Alert } from "@/lib/alertEngine";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Cat {
  id: string; name: string; birthDate?: string; sex: string; breed: string;
  lifestyle: string; sterilized: string; mainFood?: string; planDryGrams: number;
  planMealsPerDay: number; planWetPerWeek: number; notes?: string; photoUrl?: string;
}
interface Log {
  id: string; date: string; weight?: number; bcs?: number; mcs?: string;
  dryGrams?: number; wetGrams?: number; meals?: number; snackKcal?: number;
  waterMl?: number; playMinutes?: number; groomingSessions?: number;
  shedding?: number; fecesNotes?: string; vomiting?: boolean; diarrhea?: boolean;
  behaviorNotes?: string;
}
interface Prevention {
  id: string; type: string; name: string; date?: string; nextDate?: string; notes?: string;
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-md shadow-orange-50 border border-orange-50 p-4 ${className}`}>{children}</div>
);

const Badge = ({ children, color = "amber" }: { children: React.ReactNode; color?: string }) => {
  const c: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    red: "bg-red-100 text-red-600 border-red-200",
    blue: "bg-sky-100 text-sky-700 border-sky-200",
    purple: "bg-violet-100 text-violet-700 border-violet-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${c[color] ?? c.amber}`}>{children}</span>;
};

// ─── DATE PICKER ─────────────────────────────────────────────────────────────
function DatePicker({ selectedDate, onSelect, logDates }: {
  selectedDate: string; onSelect: (d: string) => void; logDates: Set<string>;
}) {
  const days = useMemo(() => {
    const arr: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split("T")[0]);
    }
    return arr;
  }, []);

  const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
          <span>📅</span> Storico
        </span>
        <span className="text-xs text-gray-300">🔵 = dati inseriti</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((d) => {
          const dt = new Date(d + "T12:00:00");
          const isToday = d === new Date().toISOString().split("T")[0];
          const isSelected = d === selectedDate;
          const hasLog = logDates.has(d);
          return (
            <button key={d} onClick={() => onSelect(d)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition flex-shrink-0 min-w-[44px] border
                ${isSelected
                  ? "bg-gradient-to-b from-amber-400 to-orange-400 text-white border-orange-300 shadow-md shadow-amber-200"
                  : isToday
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-gray-50 border-transparent text-gray-600 hover:bg-amber-50 hover:border-amber-200"}`}
            >
              <span className="text-[9px] font-bold opacity-70 leading-none">{dayNames[dt.getDay()]}</span>
              <span className="text-sm font-extrabold leading-none">{dt.getDate()}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${hasLog ? (isSelected ? "bg-white" : "bg-amber-400") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ─── LOG READ-ONLY ────────────────────────────────────────────────────────────
function LogReadOnly({ log, onEdit }: { log: Log; onEdit: () => void }) {
  const items = [
    { icon: "⚖️", label: "Peso", value: log.weight ? `${log.weight} kg` : "—", bg: "bg-blue-50" },
    { icon: "📊", label: "BCS", value: log.bcs ? `${log.bcs}/9` : "—", bg: "bg-violet-50" },
    { icon: "🥣", label: "Secco", value: log.dryGrams ? `${log.dryGrams}g` : "—", bg: "bg-amber-50" },
    { icon: "🍖", label: "Umido", value: log.wetGrams ? `${log.wetGrams}g` : "—", bg: "bg-orange-50" },
    { icon: "💧", label: "Acqua", value: log.waterMl ? `${log.waterMl}ml` : "—", bg: "bg-sky-50" },
    { icon: "🧶", label: "Gioco", value: log.playMinutes ? `${log.playMinutes}min` : "—", bg: "bg-purple-50" },
    { icon: "🪮", label: "Shedding", value: log.shedding !== undefined ? `${log.shedding}/5` : "—", bg: "bg-rose-50" },
    { icon: "🍬", label: "Snack", value: log.snackKcal ? `${log.snackKcal} kcal` : "—", bg: "bg-yellow-50" },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-gray-700 flex items-center gap-2">
          <span className="text-lg">📋</span> Log del {formatDate(log.date)}
        </h3>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl transition font-bold">
          ✏️ Modifica
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {items.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <div className="text-xs text-gray-400 mb-0.5">{s.icon} {s.label}</div>
            <div className="font-extrabold text-gray-700 text-base">{s.value}</div>
          </div>
        ))}
      </div>
      {(log.vomiting || log.diarrhea) && (
        <div className="flex gap-2 mb-2">
          {log.vomiting && <Badge color="red">🤒 Vomito</Badge>}
          {log.diarrhea && <Badge color="red">💧 Diarrea</Badge>}
        </div>
      )}
      {log.fecesNotes && <p className="text-xs text-gray-400 mt-1">💩 Feci: {log.fecesNotes}</p>}
      {log.behaviorNotes && <p className="text-xs text-gray-400 mt-1">💬 Note: {log.behaviorNotes}</p>}
    </Card>
  );
}

// ─── DAY FORM ─────────────────────────────────────────────────────────────────
function DayForm({ cat, date, existingLog, onSaved, onCancel }: {
  cat: Cat; date: string; existingLog?: Log; onSaved: (log: Log) => void; onCancel?: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const isPast = date < today;

  const [form, setForm] = useState({
    weight: existingLog?.weight?.toString() ?? "",
    bcs: existingLog?.bcs?.toString() ?? "5",
    mcs: existingLog?.mcs ?? "normal",
    dryGrams: existingLog?.dryGrams?.toString() ?? cat.planDryGrams.toString(),
    wetGrams: existingLog?.wetGrams?.toString() ?? "0",
    meals: existingLog?.meals?.toString() ?? cat.planMealsPerDay.toString(),
    snackKcal: existingLog?.snackKcal?.toString() ?? "0",
    waterMl: existingLog?.waterMl?.toString() ?? "",
    playMinutes: existingLog?.playMinutes?.toString() ?? "",
    groomingSessions: existingLog?.groomingSessions?.toString() ?? "1",
    shedding: existingLog?.shedding?.toString() ?? "1",
    fecesNotes: existingLog?.fecesNotes ?? "",
    vomiting: existingLog?.vomiting ?? false,
    diarrhea: existingLog?.diarrhea ?? false,
    behaviorNotes: existingLog?.behaviorNotes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition bg-gray-50 focus:bg-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = existingLog ? "PUT" : "POST";
      const url = existingLog
        ? `/api/cats/${cat.id}/logs/${existingLog.id}`
        : `/api/cats/${cat.id}/logs`;
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          bcs: parseInt(form.bcs), mcs: form.mcs,
          dryGrams: parseFloat(form.dryGrams), wetGrams: parseFloat(form.wetGrams),
          meals: parseInt(form.meals), snackKcal: parseFloat(form.snackKcal),
          waterMl: form.waterMl ? parseFloat(form.waterMl) : undefined,
          playMinutes: form.playMinutes ? parseInt(form.playMinutes) : undefined,
          groomingSessions: parseInt(form.groomingSessions),
          shedding: parseInt(form.shedding),
          fecesNotes: form.fecesNotes, vomiting: form.vomiting,
          diarrhea: form.diarrhea, behaviorNotes: form.behaviorNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-lg">{isPast ? "📋" : "📝"}</span>
        {isPast ? `Log del ${formatDate(date)}` : "Log di Oggi"}
        <Badge color="blue">{formatDate(date)}</Badge>
        {isPast && <Badge color="gray">⏮ Data passata</Badge>}
        {saved && <Badge color="green">✅ Salvato!</Badge>}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="⚖️ Peso (kg)">
            <input type="number" step="0.01" min="0.1" max="20" placeholder="es. 4.2"
              value={form.weight} onChange={(e) => set("weight", e.target.value)} className={inputCls} />
          </Field>
          <Field label="📊 BCS (1–9)">
            <select value={form.bcs} onChange={(e) => set("bcs", e.target.value)} className={inputCls}>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <option key={n} value={n}>{n}{n===4||n===5?" ✓":n>=8?" ⚠️":""}</option>
              ))}
            </select>
          </Field>
          <Field label="💪 MCS (muscoli)">
            <select value={form.mcs} onChange={(e) => set("mcs", e.target.value)} className={inputCls}>
              <option value="normal">Normale</option>
              <option value="mild">Lieve perdita</option>
              <option value="moderate">Moderata</option>
              <option value="severe">Severa</option>
            </select>
          </Field>
          <Field label="🪮 Shedding (0–5)">
            <select value={form.shedding} onChange={(e) => set("shedding", e.target.value)} className={inputCls}>
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="🥣 Secco (g)">
            <input type="number" min="0" value={form.dryGrams} onChange={(e) => set("dryGrams", e.target.value)} className={inputCls} />
          </Field>
          <Field label="🍖 Umido (g)">
            <input type="number" min="0" value={form.wetGrams} onChange={(e) => set("wetGrams", e.target.value)} className={inputCls} />
          </Field>
          <Field label="🍽️ Pasti (#)">
            <input type="number" min="1" max="10" value={form.meals} onChange={(e) => set("meals", e.target.value)} className={inputCls} />
          </Field>
          <Field label="🍬 Snack (kcal)">
            <input type="number" min="0" value={form.snackKcal} onChange={(e) => set("snackKcal", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="💧 Acqua (ml)">
            <input type="number" min="0" placeholder="es. 200" value={form.waterMl} onChange={(e) => set("waterMl", e.target.value)} className={inputCls} />
          </Field>
          <Field label="🧶 Gioco (min)">
            <input type="number" min="0" placeholder="es. 20" value={form.playMinutes} onChange={(e) => set("playMinutes", e.target.value)} className={inputCls} />
          </Field>
          <Field label="🛁 Grooming (#)">
            <input type="number" min="0" value={form.groomingSessions} onChange={(e) => set("groomingSessions", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="💩 Note feci/urine">
            <input placeholder="es. normale, dura..." value={form.fecesNotes} onChange={(e) => set("fecesNotes", e.target.value)} className={inputCls} />
          </Field>
          <Field label="💬 Note comportamento">
            <input placeholder="es. letargica, agitata..." value={form.behaviorNotes} onChange={(e) => set("behaviorNotes", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="flex gap-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.vomiting} onChange={(e) => set("vomiting", e.target.checked)} className="w-4 h-4 rounded accent-amber-400" />
            <span className="text-sm text-gray-600 font-medium">🤒 Vomito</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.diarrhea} onChange={(e) => set("diarrhea", e.target.checked)} className="w-4 h-4 rounded accent-amber-400" />
            <span className="text-sm text-gray-600 font-medium">💧 Diarrea</span>
          </label>
        </div>
        <div className="flex gap-2 pt-1">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition text-sm">
              ← Annulla
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-amber-100 transition">
            {loading ? "⏳ Salvataggio..." : "💾 Salva Log"}
          </button>
        </div>
      </form>
    </Card>
  );
}

// ─── CHARTS ───────────────────────────────────────────────────────────────────
const chartStyle = { fontSize: 11, borderRadius: 12, borderColor: "#fed7aa" };

function WeightChart({ logs }: { logs: Log[] }) {
  const data = logs.slice(-30).map((l) => ({
    d: l.date.slice(5).replace("-", "/"),
    peso: l.weight ?? null,
    bcs: l.bcs ?? null,
  }));
  return (
    <Card>
      <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">⚖️</span>
        Peso & BCS — ultimi 30 giorni
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff7ed" />
          <XAxis dataKey="d" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis yAxisId="l" domain={["auto", "auto"]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}kg`} />
          <YAxis yAxisId="r" orientation="right" domain={[1, 9]} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={chartStyle} formatter={(v: number, n: string) => [n === "BCS" ? `${v}/9` : `${v} kg`, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="l" type="monotone" dataKey="peso" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }} name="Peso (kg)" connectNulls />
          <Line yAxisId="r" type="monotone" dataKey="bcs" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} name="BCS" strokeDasharray="6 3" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function FoodChart({ logs }: { logs: Log[] }) {
  const data = logs.slice(-14).map((l) => ({
    d: l.date.slice(5).replace("-", "/"),
    secco: l.dryGrams ?? 0,
    umido: l.wetGrams ?? 0,
  }));
  return (
    <Card>
      <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">🥣</span>
        Alimentazione — ultimi 14 giorni
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff7ed" />
          <XAxis dataKey="d" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}g`} />
          <Tooltip contentStyle={chartStyle} formatter={(v: number, n: string) => [`${v}g`, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="secco" stackId="a" fill="#fbbf24" name="Secco (g)" />
          <Bar dataKey="umido" stackId="a" fill="#fb923c" name="Umido (g)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function ActivityChart({ logs }: { logs: Log[] }) {
  const data = logs.slice(-14).map((l) => ({
    d: l.date.slice(5).replace("-", "/"),
    gioco: l.playMinutes ?? null,
    acqua: l.waterMl ? Math.round(l.waterMl / 10) : null,
  }));
  return (
    <Card>
      <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">🧶</span>
        Gioco & Acqua — ultimi 14 giorni
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff7ed" />
          <XAxis dataKey="d" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={chartStyle} formatter={(v: number, n: string) => [n === "Acqua (×10ml)" ? `${v * 10}ml` : `${v}min`, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="gioco" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} name="Gioco (min)" connectNulls />
          <Line type="monotone" dataKey="acqua" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }} name="Acqua (×10ml)" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function SheddingChart({ logs }: { logs: Log[] }) {
  const data = logs.slice(-14).map((l) => ({
    d: l.date.slice(5).replace("-", "/"),
    shedding: l.shedding ?? 0,
    vomito: l.vomiting ? 1 : 0,
  }));
  return (
    <Card>
      <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">🪮</span>
        Shedding & Vomito — ultimi 14 giorni
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff7ed" />
          <XAxis dataKey="d" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} />
          <Tooltip contentStyle={chartStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="shedding" fill="#d97706" name="Shedding (0-5)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="vomito" fill="#f43f5e" name="Vomito (sì=1)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── PREVENTION ───────────────────────────────────────────────────────────────
function PreventionTimeline({ items, catId }: { items: Prevention[]; catId: string }) {
  const icons: Record<string, string> = { vaccine: "💉", antiparasitic: "🐛", sterilization: "✂️", visit: "🏥" };
  const sorted = [...items].sort((a, b) => (a.nextDate ?? "9999") > (b.nextDate ?? "9999") ? 1 : -1);
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-gray-700 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">🗓️</span>
          Prevenzione
        </h3>
        <Link href={`/cats/${catId}/settings#prevention`}
          className="text-xs text-amber-500 hover:text-orange-500 font-bold transition">+ Aggiungi</Link>
      </div>
      <div className="space-y-2">
        {sorted.map((item) => {
          const d = daysUntil(item.nextDate);
          const expired = d !== null && d < 0;
          const soon = d !== null && d <= 7 && d >= 0;
          return (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${expired ? "bg-red-50 border border-red-100" : soon ? "bg-amber-50 border border-amber-100" : "bg-gray-50"}`}>
              <span className="text-2xl">{icons[item.type] ?? "📌"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-700 truncate">{item.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {item.date && <span>Fatto: {formatDate(item.date)} · </span>}
                  Prossimo: {formatDate(item.nextDate)}
                  {d !== null && (
                    <span className={`ml-1 font-bold ${expired ? "text-red-500" : soon ? "text-amber-600" : "text-gray-400"}`}>
                      {expired ? ` (${-d}gg fa!)` : ` (tra ${d}gg)`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            <div className="text-3xl mb-2">💉</div>
            Nessun evento.{" "}
            <Link href={`/cats/${catId}/settings#prevention`} className="text-amber-500 font-bold hover:underline">Aggiungi il primo</Link>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── EXPORT PANEL ─────────────────────────────────────────────────────────────
function ExportPanel({ cat, onClose }: { cat: Cat; onClose: () => void }) {
  const download = async (format: "json" | "csv") => {
    const res = await fetch(`/api/cats/${cat.id}/export?format=${format}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cat.name}-${format}-${new Date().toISOString().split("T")[0]}.${format}`;
    a.click();
  };
  const share = async () => {
    const res = await fetch(`/api/cats/${cat.id}/share`, { method: "POST" });
    const data = await res.json();
    if (data.url) {
      await navigator.clipboard.writeText(data.url);
      alert(`Link copiato! Scade il ${formatDate(data.expiresAt)}\n\n${data.url}`);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-gray-800">📤 Export & Condivisione</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl transition">✕</button>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: "📄", title: "Export JSON", desc: "Profilo + Log + Prevenzione", onClick: () => download("json"), cls: "bg-gray-50 hover:bg-gray-100" },
            { icon: "📊", title: "Export CSV", desc: "Solo log giornalieri", onClick: () => download("csv"), cls: "bg-gray-50 hover:bg-gray-100" },
            { icon: "🔗", title: "Link Vet-Share", desc: "Read-only · 30gg · Copiato negli appunti", onClick: share, cls: "bg-amber-50 hover:bg-amber-100 border border-amber-100" },
          ].map((btn) => (
            <button key={btn.title} onClick={btn.onClick}
              className={`w-full flex items-center gap-3 p-3.5 ${btn.cls} rounded-2xl transition text-left`}>
              <span className="text-2xl">{btn.icon}</span>
              <div>
                <div className="font-bold text-gray-700 text-sm">{btn.title}</div>
                <div className="text-xs text-gray-400">{btn.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CatDashboardClient({ cat: initialCat, logs: initialLogs, prevention: initialPrev, alerts: initialAlerts }: {
  cat: Cat; logs: Log[]; prevention: Prevention[]; alerts: Alert[];
}) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [showExport, setShowExport] = useState(false);
  const [tab, setTab] = useState<"log" | "grafici" | "prevenzione">("log");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingPast, setEditingPast] = useState(false);

  const logDates = useMemo(() => new Set(logs.map((l) => l.date)), [logs]);
  const selectedLog = logs.find((l) => l.date === selectedDate);
  const lastLog = logs[logs.length - 1];
  const isPastDate = selectedDate < today;
  const showReadOnly = isPastDate && selectedLog && !editingPast;

  const handleLogSaved = (log: Log) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === log.id || l.date === log.date);
      if (idx >= 0) { const n = [...prev]; n[idx] = log; return n; }
      return [...prev, log].sort((a, b) => a.date > b.date ? 1 : -1);
    });
    setEditingPast(false);
  };

  const statCards = lastLog ? [
    { icon: "⚖️", label: "Peso", value: lastLog.weight ? `${lastLog.weight} kg` : "—", sub: lastLog.bcs ? `BCS ${lastLog.bcs}/9` : "", bg: "from-blue-50 to-sky-50", border: "border-sky-100" },
    { icon: "🥣", label: "Secco", value: lastLog.dryGrams ? `${lastLog.dryGrams}g` : "—", sub: `Target ${initialCat.planDryGrams}g`, bg: "from-amber-50 to-yellow-50", border: "border-amber-100" },
    { icon: "🧶", label: "Gioco", value: lastLog.playMinutes ? `${lastLog.playMinutes}min` : "—", sub: formatDate(lastLog.date), bg: "from-violet-50 to-purple-50", border: "border-violet-100" },
    { icon: "💧", label: "Acqua", value: lastLog.waterMl ? `${lastLog.waterMl}ml` : "—", sub: "stimata", bg: "from-sky-50 to-blue-50", border: "border-sky-100" },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Cat header */}
      <div className="bg-white rounded-2xl border border-orange-50 shadow-md shadow-orange-50 p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden shadow-sm">
            {initialCat.photoUrl ? <img src={initialCat.photoUrl} alt={initialCat.name} className="w-full h-full object-cover" /> : "🐱"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-gray-800">{initialCat.name}</h1>
              <Badge color="orange">🏡 {initialCat.lifestyle === "indoor" ? "Indoor" : initialCat.lifestyle === "outdoor" ? "Outdoor" : "Misto"}</Badge>
              {initialCat.sterilized === "yes" && <Badge color="green">✂️ Sterilizzato/a</Badge>}
            </div>
            <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3">
              <span>🎂 {calcAge(initialCat.birthDate)}</span>
              {lastLog?.weight && <span>⚖️ {lastLog.weight} kg</span>}
              {lastLog?.bcs && <span>BCS {lastLog.bcs}/9</span>}
            </div>
            {initialCat.mainFood && <div className="text-xs text-gray-400 mt-0.5 truncate">🥣 {initialCat.mainFood} · {initialCat.planDryGrams}g/die</div>}
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Link href={`/cats/${initialCat.id}/settings`}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition font-medium">✏️ Modifica</Link>
            <button onClick={() => setShowExport(true)}
              className="px-3 py-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl transition font-medium">📤 Export</button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {initialAlerts.map((a, i) => (
        <div key={i} className={`flex items-start gap-2.5 p-3.5 rounded-2xl text-sm border ${a.level === "hard" ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          <span className="text-xl flex-shrink-0">{a.icon}</span>
          <span>{a.message}</span>
        </div>
      ))}

      {/* Quick stats */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-2xl border ${s.border} p-3 shadow-sm`}>
              <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">{s.icon} {s.label}</div>
              <div className="text-xl font-extrabold text-gray-700">{s.value}</div>
              {s.sub && <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-orange-50 shadow-md shadow-orange-50 p-1.5">
        {([["log", "📝 Log"], ["grafici", "📊 Grafici"], ["prevenzione", "💉 Prevenzione"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition ${tab === id
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200"
              : "text-gray-400 hover:text-gray-600 hover:bg-orange-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: LOG */}
      {tab === "log" && (
        <div className="space-y-4">
          <DatePicker selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setEditingPast(false); }} logDates={logDates} />
          {showReadOnly
            ? <LogReadOnly log={selectedLog!} onEdit={() => setEditingPast(true)} />
            : <DayForm cat={initialCat} date={selectedDate} existingLog={selectedLog} onSaved={handleLogSaved}
                onCancel={isPastDate && selectedLog ? () => setEditingPast(false) : undefined} />
          }
          {isPastDate && !selectedLog && !editingPast && (
            <p className="text-center text-sm text-gray-400 py-2">📭 Nessun dato per questo giorno — puoi inserirlo con il form sopra.</p>
          )}
        </div>
      )}

      {/* Tab: GRAFICI */}
      {tab === "grafici" && (
        logs.length >= 2 ? (
          <div className="space-y-4">
            <WeightChart logs={logs} />
            <FoodChart logs={logs} />
            <ActivityChart logs={logs} />
            <SheddingChart logs={logs} />
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-bold text-gray-600">Inserisci almeno 2 giorni di log per vedere i grafici.</p>
            <p className="text-sm text-gray-400 mt-1">Usa il tab <strong>Log</strong> per iniziare.</p>
          </Card>
        )
      )}

      {/* Tab: PREVENZIONE */}
      {tab === "prevenzione" && <PreventionTimeline items={initialPrev} catId={initialCat.id} />}

      {/* Disclaimer */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-xs text-sky-700 flex items-start gap-2">
        <span className="text-base flex-shrink-0">🩺</span>
        <span><strong>Nota:</strong> Strumento di monitoraggio personale — non sostituisce la visita veterinaria. Range indicativi da WSAVA/AAHA/AAFP.</span>
      </div>

      {showExport && <ExportPanel cat={initialCat} onClose={() => setShowExport(false)} />}
    </div>
  );
}
