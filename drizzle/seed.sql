-- seed.sql - Dati di esempio (opzionale)
-- Esegui con: npm run db:seed:local  oppure  npm run db:seed:prod
-- Nota: richiede che esista un utente con id 'demo-user-001'
-- In produzione ogni utente crea i propri gatti dopo la registrazione

-- Utente demo (solo per sviluppo locale)
INSERT OR IGNORE INTO users (id, email, name, email_verified)
VALUES ('demo-user-001', 'demo@example.com', 'Demo Utente', 1);

-- Gatto Micia (collegato all'utente demo)
INSERT OR IGNORE INTO cats (
  id, user_id, name, birth_date, sex, breed, lifestyle, sterilized,
  main_food, food_kcal_per_kg, plan_dry_grams, plan_meals_per_day,
  plan_wet_per_week, notes
) VALUES (
  'micia-001', 'demo-user-001', 'Micia', '2024-10-10',
  'unknown', 'unknown', 'indoor', 'unknown',
  'Advance Active Defense Kitten', 3800, 60, 3, 1,
  'Molto giocosa, alta attività. Fontanella per l''acqua. Perde pelo in modo normale.'
);

-- Prevenzione Micia
INSERT OR IGNORE INTO prevention (id, cat_id, type, name, date, next_date, notes) VALUES
  ('v1','micia-001','vaccine','Trivalente (FHV/FCV/FPV) 1a dose','2025-01-15','2025-02-12','Core vaccine - AAHA/AAFP 2020'),
  ('v2','micia-001','vaccine','Trivalente (FHV/FCV/FPV) 2a dose','2025-02-12','2025-03-12','Core vaccine'),
  ('v3','micia-001','vaccine','Trivalente (FHV/FCV/FPV) 3a dose','2025-03-12','2026-03-12','Booster annuale'),
  ('p1','micia-001','antiparasitic','Antiparassitario interno (ESCCAP)','2025-02-01','2025-05-01','Endoparassiti ogni 3 mesi indoor'),
  ('p2','micia-001','antiparasitic','Antiparassitario esterno (pulci/zecche)','2025-03-01','2025-04-01','Ectoparassiti - mensile'),
  ('s1','micia-001','sterilization','Sterilizzazione (~6 mesi)',NULL,'2025-04-10','Da concordare col veterinario');

-- Log ultimi 7 giorni di esempio
INSERT OR IGNORE INTO daily_logs (id, cat_id, date, weight, bcs, mcs, dry_grams, wet_grams, meals, water_ml, play_minutes, grooming_sessions, shedding, vomiting, diarrhea) VALUES
  ('log-1','micia-001','2025-03-04', 2.82, 4, 'normal', 57, 0, 3, 170, 35, 2, 1, 0, 0),
  ('log-2','micia-001','2025-03-05', 2.83, 4, 'normal', 60, 0, 3, 185, 40, 1, 1, 0, 0),
  ('log-3','micia-001','2025-03-06', 2.84, 4, 'normal', 58, 85, 3, 160, 30, 2, 2, 0, 0),
  ('log-4','micia-001','2025-03-07', 2.85, 4, 'normal', 61, 0, 3, 190, 45, 2, 1, 0, 0),
  ('log-5','micia-001','2025-03-08', 2.86, 4, 'normal', 59, 0, 3, 175, 50, 1, 1, 0, 0),
  ('log-6','micia-001','2025-03-09', 2.88, 5, 'normal', 60, 0, 3, 180, 35, 2, 2, 0, 0),
  ('log-7','micia-001','2025-03-10', 2.90, 5, 'normal', 58, 0, 3, 195, 60, 2, 1, 0, 0);
