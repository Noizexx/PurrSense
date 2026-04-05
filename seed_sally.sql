-- Prima verifichiamo il cat_id di Sally_test
-- Esegui questo per vedere l'ID: SELECT id, name FROM cats;

-- Inserimento 7 giorni di log (30 marzo - 5 aprile 2026)
-- SOSTITUISCI 'CAT_ID_QUI' con l'id reale di Sally_test trovato sopra

INSERT INTO daily_logs (id, cat_id, date, weight, bcs, mcs, dry_grams, wet_grams, meals, snack_kcal, water_ml, play_minutes, grooming_sessions, shedding, feces_notes, vomiting, diarrhea, behavior_notes) VALUES
('log_30mar', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-03-30', 4.20, 5, 'normal', 55.0, 85.0, 3, 10, 200, 20, 1, 2, 'Normale, forma regolare', 0, 0, 'Attiva e giocosa, ha esplorato il balcone'),
('log_31mar', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-03-31', 4.18, 5, 'normal', 60.0, 0.0,  3, 0,  180, 15, 2, 2, 'Normale', 0, 0, 'Un po'' pigra oggi, ha dormito molto'),
('log_01apr', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-04-01', 4.22, 5, 'normal', 55.0, 90.0, 3, 5,  220, 25, 1, 3, 'Normale, abbondante', 0, 0, 'Molto vivace, ha giocato a lungo'),
('log_02apr', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-04-02', 4.15, 5, 'normal', 50.0, 85.0, 2, 15, 190, 10, 1, 2, 'Normale', 1, 0, 'Ha vomitato una volta al mattino (pelo)'),
('log_03apr', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-04-03', 4.17, 5, 'normal', 58.0, 0.0,  3, 0,  210, 20, 2, 2, 'Normale, forma ok', 0, 0, 'Tornata in forma, appetito normale'),
('log_04apr', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-04-04', 4.25, 6, 'normal', 62.0, 85.0, 3, 20, 230, 30, 1, 3, 'Normale', 0, 0, 'Energicissima, ha cacciato il cuscino per 10 minuti'),
('log_05apr', (SELECT id FROM cats WHERE name='Sally_test' LIMIT 1), '2026-04-05', 4.21, 5, 'normal', 57.0, 90.0, 3, 10, 215, 25, 2, 2, 'Normale', 0, 0, 'Giornata tranquilla, tante coccole');
