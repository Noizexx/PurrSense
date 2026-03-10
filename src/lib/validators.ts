import { z } from "zod";

export const registerSchema = z.object({
  name:     z.string().min(2, "Nome troppo corto").max(50),
  email:    z.string().email("Email non valida"),
  password: z
    .string()
    .min(8, "Minimo 8 caratteri")
    .regex(/[A-Z]/, "Almeno una lettera maiuscola")
    .regex(/[0-9]/, "Almeno un numero"),
});

export const catSchema = z.object({
  name:            z.string().min(1, "Nome obbligatorio").max(50),
  birthDate:       z.string().optional(),
  sex:             z.enum(["male", "female", "unknown"]).default("unknown"),
  breed:           z.string().max(50).default("unknown"),
  lifestyle:       z.enum(["indoor", "outdoor", "mixed"]).default("indoor"),
  sterilized:      z.enum(["yes", "no", "unknown"]).default("unknown"),
  microchip:       z.string().max(30).optional(),
  mainFood:        z.string().max(100).optional(),
  foodKcalPerKg:   z.number().int().min(0).max(10000).optional(),
  planDryGrams:    z.number().int().min(0).max(1000).default(60),
  planMealsPerDay: z.number().int().min(1).max(20).default(3),
  planWetPerWeek:  z.number().int().min(0).max(14).default(1),
  notes:           z.string().max(500).optional(),
});

export const logSchema = z.object({
  date:             z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data non valido"),
  weight:           z.number().min(0.1).max(20).optional(),
  bcs:              z.number().int().min(1).max(9).optional(),
  mcs:              z.enum(["normal", "mild", "moderate", "severe"]).optional(),
  dryGrams:         z.number().min(0).max(2000).optional(),
  wetGrams:         z.number().min(0).max(2000).optional(),
  meals:            z.number().int().min(0).max(20).optional(),
  snackKcal:        z.number().min(0).max(1000).optional(),
  waterMl:          z.number().min(0).max(5000).optional(),
  playMinutes:      z.number().int().min(0).max(1440).optional(),
  groomingSessions: z.number().int().min(0).max(20).optional(),
  shedding:         z.number().int().min(0).max(5).optional(),
  fecesNotes:       z.string().max(300).optional(),
  vomiting:         z.boolean().default(false),
  diarrhea:         z.boolean().default(false),
  behaviorNotes:    z.string().max(300).optional(),
});

export const preventionSchema = z.object({
  type:     z.enum(["vaccine", "antiparasitic", "sterilization", "visit"]),
  name:     z.string().min(1).max(100),
  date:     z.string().optional(),
  nextDate: z.string().optional(),
  notes:    z.string().max(300).optional(),
});

export type RegisterInput   = z.infer<typeof registerSchema>;
export type CatInput        = z.infer<typeof catSchema>;
export type LogInput        = z.infer<typeof logSchema>;
export type PreventionInput = z.infer<typeof preventionSchema>;
