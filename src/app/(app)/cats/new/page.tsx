"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export default function NewCatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    name: "", birthDate: "", sex: "unknown", breed: "",
    lifestyle: "indoor", sterilized: "unknown", microchip: "",
    mainFood: "", foodKcalPerKg: "", planDryGrams: "60",
    planMealsPerDay: "3", planWetPerWeek: "1", notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setPhotoUrl(data.url);
      else setError(data.error ?? "Errore caricamento foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photoUrl: photoUrl || undefined,
          foodKcalPerKg: form.foodKcalPerKg ? parseInt(form.foodKcalPerKg) : undefined,
          planDryGrams: parseInt(form.planDryGrams),
          planMealsPerDay: parseInt(form.planMealsPerDay),
          planWetPerWeek: parseInt(form.planWetPerWeek),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Errore");
      else router.push(`/cats/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition";

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nuovo gatto</h1>
          <p className="text-sm text-gray-500">Compila il profilo del tuo gatto</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
          )}

          {/* Foto profilo */}
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="photo-upload" className="cursor-pointer group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-4xl overflow-hidden relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Anteprima" className="w-full h-full object-cover" />
                ) : (
                  <span>🐱</span>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-2xl">
                  <span className="text-white text-xs font-semibold">Cambia</span>
                </div>
              </div>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhoto}
            />
            <p className="text-xs text-gray-400">
              {uploadingPhoto ? "⏳ Caricamento..." : "Clicca per aggiungere la foto"}
            </p>
          </div>

          <Field label="Nome *">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className={inputCls} placeholder="es. Micio" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data di nascita">
              <input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Sesso">
              <select value={form.sex} onChange={(e) => set("sex", e.target.value)} className={inputCls}>
                <option value="unknown">Non noto</option>
                <option value="female">Femmina</option>
                <option value="male">Maschio</option>
              </select>
            </Field>
            <Field label="Razza">
              <input value={form.breed} onChange={(e) => set("breed", e.target.value)}
                className={inputCls} placeholder="es. Europeo" />
            </Field>
            <Field label="Stile di vita">
              <select value={form.lifestyle} onChange={(e) => set("lifestyle", e.target.value)} className={inputCls}>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="mixed">Misto</option>
              </select>
            </Field>
            <Field label="Sterilizzato/a">
              <select value={form.sterilized} onChange={(e) => set("sterilized", e.target.value)} className={inputCls}>
                <option value="unknown">Non noto</option>
                <option value="yes">Sì</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Microchip">
              <input value={form.microchip} onChange={(e) => set("microchip", e.target.value)}
                className={inputCls} placeholder="Numero (opz.)" />
            </Field>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🍽️ Piano alimentare</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Alimento principale">
                <input value={form.mainFood} onChange={(e) => set("mainFood", e.target.value)}
                  className={inputCls} placeholder="es. Royal Canin Kitten" />
              </Field>
              <Field label="Kcal/kg alimento">
                <input type="number" value={form.foodKcalPerKg} onChange={(e) => set("foodKcalPerKg", e.target.value)}
                  className={inputCls} placeholder="es. 3800" />
              </Field>
              <Field label="Secco g/die">
                <input type="number" min="0" value={form.planDryGrams} onChange={(e) => set("planDryGrams", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Pasti/die">
                <input type="number" min="1" max="10" value={form.planMealsPerDay} onChange={(e) => set("planMealsPerDay", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Umido pasti/settimana">
                <input type="number" min="0" max="14" value={form.planWetPerWeek} onChange={(e) => set("planWetPerWeek", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>

          <Field label="Note">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={inputCls + " resize-none"} rows={3} placeholder="Abitudini, carattere, note sanitarie..." />
          </Field>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl transition">
            {loading ? "Salvataggio..." : "🐱 Crea profilo gatto"}
          </button>
        </form>
      </div>
    </div>
  );
}
