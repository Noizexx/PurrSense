export const runtime = 'edge';
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Prevention {
  id: string; type: string; name: string; date?: string; nextDate?: string; notes?: string;
}

export default function CatSettingsPage() {
  const { catId } = useParams<{ catId: string }>();
  const router = useRouter();
  const [cat, setCat] = useState<any>(null);
  const [prevention, setPrevention] = useState<Prevention[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPrev, setNewPrev] = useState({ type: "vaccine", name: "", date: "", nextDate: "", notes: "" });
  const [addingPrev, setAddingPrev] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/cats/${catId}`).then(r => r.json()),
      fetch(`/api/cats/${catId}/prevention`).then(r => r.json()),
    ]).then(([catData, prevData]) => {
      setCat(catData);
      setPrevention(Array.isArray(prevData) ? prevData : []);
    }).finally(() => setLoading(false));
  }, [catId]);

  const handleSaveCat = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cats/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  };

  const handleAddPrev = async () => {
    const res = await fetch(`/api/cats/${catId}/prevention`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPrev),
    });
    if (res.ok) {
      const item = await res.json();
      setPrevention(p => [...p, item]);
      setNewPrev({ type: "vaccine", name: "", date: "", nextDate: "", notes: "" });
      setAddingPrev(false);
    }
  };

  const handleDeletePrev = async (id: string) => {
    if (!confirm("Eliminare questo evento?")) return;
    const res = await fetch(`/api/cats/${catId}/prevention?id=${id}`, { method: "DELETE" });
    if (res.ok) setPrevention(p => p.filter(x => x.id !== id));
  };

  const handleDeleteCat = async () => {
    if (!confirm(`Eliminare ${cat.name} e tutti i suoi dati? Questa azione è irreversibile.`)) return;
    await fetch(`/api/cats/${catId}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Caricamento...</div>;
  if (!cat) return <div className="text-center py-16 text-red-400">Gatto non trovato</div>;

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/cats/${catId}`} className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Impostazioni — {cat.name}</h1>
          <p className="text-sm text-gray-500">Modifica profilo e prevenzione</p>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-700">Profilo</h2>
        {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-2 text-center">✅ Salvato!</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome">
            <input value={cat.name} onChange={e => setCat((c: any) => ({ ...c, name: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Data di nascita">
            <input type="date" value={cat.birthDate ?? ""} onChange={e => setCat((c: any) => ({ ...c, birthDate: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Sesso">
            <select value={cat.sex} onChange={e => setCat((c: any) => ({ ...c, sex: e.target.value }))} className={inputCls}>
              <option value="unknown">Non noto</option>
              <option value="female">Femmina</option>
              <option value="male">Maschio</option>
            </select>
          </Field>
          <Field label="Razza">
            <input value={cat.breed} onChange={e => setCat((c: any) => ({ ...c, breed: e.target.value }))} className={inputCls} placeholder="es. Europeo" />
          </Field>
          <Field label="Stile di vita">
            <select value={cat.lifestyle} onChange={e => setCat((c: any) => ({ ...c, lifestyle: e.target.value }))} className={inputCls}>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="mixed">Misto</option>
            </select>
          </Field>
          <Field label="Sterilizzato/a">
            <select value={cat.sterilized} onChange={e => setCat((c: any) => ({ ...c, sterilized: e.target.value }))} className={inputCls}>
              <option value="unknown">Non noto</option>
              <option value="yes">Sì</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Microchip">
            <input value={cat.microchip ?? ""} onChange={e => setCat((c: any) => ({ ...c, microchip: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Alimento principale">
            <input value={cat.mainFood ?? ""} onChange={e => setCat((c: any) => ({ ...c, mainFood: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Secco g/die">
            <input type="number" value={cat.planDryGrams} onChange={e => setCat((c: any) => ({ ...c, planDryGrams: +e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Pasti/die">
            <input type="number" value={cat.planMealsPerDay} onChange={e => setCat((c: any) => ({ ...c, planMealsPerDay: +e.target.value }))} className={inputCls} />
          </Field>
        </div>
        <Field label="Note">
          <textarea value={cat.notes ?? ""} onChange={e => setCat((c: any) => ({ ...c, notes: e.target.value }))} className={inputCls + " resize-none"} rows={3} />
        </Field>
        <button onClick={handleSaveCat} disabled={saving}
          className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl transition">
          {saving ? "Salvataggio..." : "💾 Salva Modifiche"}
        </button>
      </div>

      {/* Prevention */}
      <div id="prevention" className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Prevenzione</h2>
          <button onClick={() => setAddingPrev(true)} className="text-sm text-amber-600 hover:underline font-medium">+ Aggiungi</button>
        </div>

        {addingPrev && (
          <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-200">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Tipo">
                <select value={newPrev.type} onChange={e => setNewPrev(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                  <option value="vaccine">💉 Vaccino</option>
                  <option value="antiparasitic">🐛 Antiparassitario</option>
                  <option value="sterilization">✂️ Sterilizzazione</option>
                  <option value="visit">🏥 Visita</option>
                </select>
              </Field>
              <Field label="Nome *">
                <input value={newPrev.name} onChange={e => setNewPrev(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="es. Trivalente" />
              </Field>
              <Field label="Data esecuzione">
                <input type="date" value={newPrev.date} onChange={e => setNewPrev(p => ({ ...p, date: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Prossima scadenza">
                <input type="date" value={newPrev.nextDate} onChange={e => setNewPrev(p => ({ ...p, nextDate: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddPrev} className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition">Aggiungi</button>
              <button onClick={() => setAddingPrev(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm transition">Annulla</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {prevention.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
              <span className="text-lg">{p.type === "vaccine" ? "💉" : p.type === "antiparasitic" ? "🐛" : p.type === "sterilization" ? "✂️" : "🏥"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 truncate">{p.name}</div>
                <div className="text-xs text-gray-400">{p.nextDate ? `Prossimo: ${p.nextDate}` : "Nessuna scadenza"}</div>
              </div>
              <button onClick={() => handleDeletePrev(p.id)} className="text-red-400 hover:text-red-600 text-sm transition">🗑️</button>
            </div>
          ))}
          {prevention.length === 0 && !addingPrev && (
            <p className="text-sm text-gray-400 text-center py-4">Nessun evento di prevenzione</p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
        <h2 className="font-bold text-red-700 mb-2">⚠️ Zona pericolo</h2>
        <p className="text-sm text-gray-500 mb-3">Elimina {cat.name} e tutti i log associati. Operazione irreversibile.</p>
        <button onClick={handleDeleteCat}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition">
          🗑️ Elimina {cat.name}
        </button>
      </div>
    </div>
  );
}
