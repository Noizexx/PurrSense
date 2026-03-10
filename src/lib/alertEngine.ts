export type AlertLevel = "soft" | "hard";

export interface Alert {
  level: AlertLevel;
  category: string;
  message: string;
  icon: string;
}

export interface LogEntry {
  date: string;
  weight?: number | null;
  bcs?: number | null;
  mcs?: string | null;
  vomiting?: boolean | null;
  diarrhea?: boolean | null;
  waterMl?: number | null;
  playMinutes?: number | null;
  shedding?: number | null;
}

export interface PreventionEntry {
  name: string;
  nextDate?: string | null;
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateAlerts(
  logs: LogEntry[],
  prevention: PreventionEntry[]
): Alert[] {
  const alerts: Alert[] = [];
  if (!logs.length) return alerts;

  const recent7 = logs.slice(-7);
  const last = logs[logs.length - 1];

  // ─── BCS ──────────────────────────────────────────────────────────────────
  if (last.bcs != null) {
    if (last.bcs >= 8) {
      alerts.push({
        level: "hard",
        category: "BCS",
        icon: "🚨",
        message: `BCS ${last.bcs}/9: condizione di obesità. Contatta il veterinario.`,
      });
    } else if (last.bcs >= 6) {
      alerts.push({
        level: "soft",
        category: "BCS",
        icon: "⚠️",
        message: `BCS ${last.bcs}/9: tendenza al sovrappeso (WSAVA: ideale 4–5). Monitora l'alimentazione.`,
      });
    }
  }

  // ─── PESO TREND ───────────────────────────────────────────────────────────
  const logsWithWeight = recent7.filter((l) => l.weight != null);
  if (logsWithWeight.length >= 3) {
    const first = logsWithWeight[0].weight!;
    const lastW = logsWithWeight[logsWithWeight.length - 1].weight!;
    const changePct = ((lastW - first) / first) * 100;
    if (changePct < -5) {
      alerts.push({
        level: "soft",
        category: "Peso",
        icon: "📉",
        message: `Calo peso ${changePct.toFixed(1)}% in 7 giorni. Da monitorare — contatta il vet se persiste.`,
      });
    } else if (changePct > 8) {
      alerts.push({
        level: "soft",
        category: "Peso",
        icon: "📈",
        message: `Aumento peso ${changePct.toFixed(1)}% in 7 giorni. Verifica la dieta.`,
      });
    }
  }

  // ─── VOMITO ───────────────────────────────────────────────────────────────
  const vomitDays = recent7.filter((l) => l.vomiting).length;
  if (vomitDays >= 3) {
    alerts.push({
      level: "hard",
      category: "Salute",
      icon: "🚨",
      message: `Vomito registrato ${vomitDays} giorni su 7. Contatta il veterinario.`,
    });
  } else if (vomitDays >= 2) {
    alerts.push({
      level: "soft",
      category: "Salute",
      icon: "⚠️",
      message: `Vomito registrato ${vomitDays} giorni su 7. Tieni d'occhio la situazione.`,
    });
  }

  // ─── DIARREA ──────────────────────────────────────────────────────────────
  const diarrheaDays = recent7.filter((l) => l.diarrhea).length;
  if (diarrheaDays >= 2) {
    alerts.push({
      level: "hard",
      category: "Salute",
      icon: "🚨",
      message: `Diarrea ${diarrheaDays} giorni su 7. Contatta il veterinario.`,
    });
  }

  // ─── MCS ──────────────────────────────────────────────────────────────────
  if (last.mcs === "severe") {
    alerts.push({
      level: "hard",
      category: "Pelo",
      icon: "🚨",
      message: "MCS severe: perdita massiccia di pelo. Consulta il veterinario.",
    });
  } else if (last.mcs === "moderate") {
    alerts.push({
      level: "soft",
      category: "Pelo",
      icon: "⚠️",
      message: "MCS moderate: perdita di pelo superiore alla norma. Da monitorare.",
    });
  }

  // ─── PREVENZIONE ──────────────────────────────────────────────────────────
  prevention.forEach((p) => {
    if (!p.nextDate) return;
    const d = daysUntil(p.nextDate);
    if (d < 0) {
      alerts.push({
        level: "hard",
        category: "Prevenzione",
        icon: "⏰",
        message: `SCADUTO: ${p.name} (${Math.abs(d)} giorni fa). Contatta il veterinario.`,
      });
    } else if (d <= 7) {
      alerts.push({
        level: "soft",
        category: "Prevenzione",
        icon: "📅",
        message: `Scadenza imminente: ${p.name} tra ${d} giorn${d === 1 ? "o" : "i"}.`,
      });
    }
  });

  return alerts;
}
