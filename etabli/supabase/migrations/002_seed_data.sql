-- ========================================================
-- SOS Hub Canada - Données initiales (seed)
-- ========================================================

-- ============ USERS ============
INSERT INTO users (id, email, name, role, active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'marie@soshub.ca', 'Marie Tremblay', 'receptionniste', true),
  ('00000000-0000-0000-0000-000000000002', 'ahmed@soshub.ca', 'Ahmed Benali', 'conseiller', true),
  ('00000000-0000-0000-0000-000000000003', 'sophie@soshub.ca', 'Sophie Lavoie', 'technicienne_juridique', true),
  ('00000000-0000-0000-0000-000000000004', 'jp@soshub.ca', 'Me. Jean-Pierre Roy', 'avocat_consultant', true),
  ('00000000-0000-0000-0000-000000000005', 'fatima@soshub.ca', 'Fatima Zahra', 'coordinatrice', true);

-- ============ CLIENTS ============
INSERT INTO clients (id, first_name, last_name, email, phone, date_of_birth, nationality, current_country, current_status, passport_number, passport_expiry, address, city, province, postal_code, status, assigned_to, notes, language_english, language_french, education, work_experience, marital_status, dependants) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Carlos', 'Rodriguez', 'carlos@email.com', '+1-514-555-0101', '1990-05-15', 'Colombie', 'Canada', 'travailleur', 'CO1234567', '2028-03-20', '1234 Rue Saint-Denis', 'Montréal', 'QC', 'H2X 3K5', 'actif', '00000000-0000-0000-0000-000000000002', 'Intéressé par RP via PEQ - voie travailleurs', 'CLB 7', 'NCLC 8', 'Baccalauréat en informatique', '5 ans - Développeur logiciel (NOC 21232)', 'Marié', 1),
  ('10000000-0000-0000-0000-000000000002', 'Amina', 'Diallo', 'amina@email.com', '+1-514-555-0102', '1988-11-03', 'Sénégal', 'Canada', 'demandeur_asile', 'SN9876543', '2026-07-15', '567 Boul. René-Lévesque', 'Montréal', 'QC', 'H3B 1H7', 'actif', '00000000-0000-0000-0000-000000000004', 'Demande d''asile - persécution politique. Audience CISR planifiée pour avril 2024.', 'CLB 4', 'NCLC 9', 'Maîtrise en journalisme', '8 ans - Journaliste (NOC 51111)', 'Célibataire', 2),
  ('10000000-0000-0000-0000-000000000003', 'Wei', 'Zhang', 'wei@email.com', '+1-514-555-0103', '1995-02-28', 'Chine', 'Canada', 'etudiant', 'CN5555555', '2029-01-10', '890 Rue Sherbrooke Ouest', 'Montréal', 'QC', 'H3A 1G1', 'actif', '00000000-0000-0000-0000-000000000002', 'Finit sa maîtrise en mai 2024. Veut PTPD puis PEQ voie diplômés.', 'CLB 9', 'NCLC 6', 'Maîtrise en génie électrique (en cours)', '2 ans - Stage en ingénierie', 'Célibataire', 0),
  ('10000000-0000-0000-0000-000000000004', 'Fatima', 'Al-Hassan', 'fatima.h@email.com', '+1-514-555-0104', '1985-07-12', 'Syrie', 'Canada', 'personne_protegee', '', '', '321 Ave du Parc', 'Montréal', 'QC', 'H2V 4E7', 'actif', '00000000-0000-0000-0000-000000000004', 'Personne protégée depuis 2023. Demande de RP en cours.', 'CLB 3', 'NCLC 5', 'Diplôme d''études secondaires', '3 ans - Couturière', 'Veuve', 3),
  ('10000000-0000-0000-0000-000000000005', 'Jean-Baptiste', 'Nguema', 'jb@email.com', '+1-438-555-0105', '1992-03-19', 'Cameroun', 'Canada', 'travailleur', 'CM3333333', '2027-09-01', '456 Rue Jean-Talon', 'Montréal', 'QC', 'H2R 1S9', 'actif', '00000000-0000-0000-0000-000000000003', 'Profil très fort pour Entrée express FSW. Score CRS estimé: 485.', 'CLB 8', 'NCLC 10', 'Maîtrise en génie civil', '6 ans - Ingénieur civil (NOC 21300)', 'Célibataire', 0),
  ('10000000-0000-0000-0000-000000000006', 'Priya', 'Sharma', 'priya@email.com', '+1-514-555-0106', '1993-09-08', 'Inde', 'Inde', 'etranger', 'IN8888888', '2030-05-20', '15 MG Road', 'New Delhi', '', '110001', 'prospect', '00000000-0000-0000-0000-000000000002', 'Consultation initiale demandée. Intérêt pour permis d''études au Québec.', 'CLB 8', 'NCLC 4', 'Baccalauréat en commerce', '4 ans - Analyste financier', 'Célibataire', 0),
  ('10000000-0000-0000-0000-000000000007', 'Mohamed', 'Bouazizi', 'mohamed.b@email.com', '+1-438-555-0107', '1987-12-01', 'Tunisie', 'Canada', 'resident_permanent', 'TN4444444', '2028-11-15', '789 Boul. Saint-Laurent', 'Montréal', 'QC', 'H2T 1R2', 'actif', '00000000-0000-0000-0000-000000000003', 'RP depuis 2020. Veut la citoyenneté.', 'CLB 6', 'NCLC 10', 'Doctorat en pharmacie', '10 ans - Pharmacien', 'Marié', 2);

-- ============ FAMILY MEMBERS ============
INSERT INTO family_members (client_id, relationship, first_name, last_name, date_of_birth, nationality, passport_number, accompany) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Épouse', 'Maria', 'Rodriguez', '1992-08-22', 'Colombie', 'CO7654321', true),
  ('10000000-0000-0000-0000-000000000002', 'Fils', 'Ibrahim', 'Diallo', '2015-04-10', 'Sénégal', 'SN1111111', true),
  ('10000000-0000-0000-0000-000000000002', 'Fille', 'Fatou', 'Diallo', '2018-09-25', 'Sénégal', 'SN2222222', true),
  ('10000000-0000-0000-0000-000000000004', 'Fils', 'Omar', 'Al-Hassan', '2010-01-05', 'Syrie', '', true),
  ('10000000-0000-0000-0000-000000000004', 'Fille', 'Layla', 'Al-Hassan', '2012-06-18', 'Syrie', '', true),
  ('10000000-0000-0000-0000-000000000004', 'Fils', 'Hassan', 'Al-Hassan', '2016-11-30', 'Syrie', '', true),
  ('10000000-0000-0000-0000-000000000007', 'Épouse', 'Salma', 'Bouazizi', '1990-04-15', 'Tunisie', 'TN5555555', true),
  ('10000000-0000-0000-0000-000000000007', 'Fils', 'Youssef', 'Bouazizi', '2019-07-22', 'Canada', '', true);

-- ============ CASES ============
INSERT INTO cases (id, client_id, program_id, title, status, assigned_to, assigned_lawyer, priority, deadline, ircc_app_number, uci_number, notes) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'pnp-peq', 'PEQ - Voie travailleurs', 'en_preparation', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'normale', '2024-06-30', '', '1234-5678', 'CSQ en cours de traitement au MIFI'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'asile-inland', 'Demande d''asile - Persécution politique', 'formulaires_remplis', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'urgente', '2024-04-15', 'ASY-2024-00123', '2345-6789', 'Audience CISR planifiée le 15 avril 2024.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'pgwp', 'PTPD - Post-diplôme', 'soumis', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'haute', '2024-05-01', 'WP-2024-00456', '3456-7890', 'Demande soumise le 8 mars.'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'protected-person-pr', 'RP - Personne protégée', 'en_traitement_ircc', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'haute', NULL, 'PR-2023-00789', '4567-8901', 'En traitement IRCC. ARC reçu en février.'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'ee-fsw', 'Entrée express - FSW', 'consultation', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'normale', '2024-09-01', '', '5678-9012', 'Score CRS estimé: 485. Avec bonus francophone: ~515.'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000007', 'citizenship-adult', 'Citoyenneté canadienne', 'en_preparation', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'normale', '2024-06-01', '', '6789-0123', 'Vérification des jours de présence physique en cours.');

-- ============ TIMELINE EVENTS ============
INSERT INTO timeline_events (case_id, date, type, description, user_id) VALUES
  ('20000000-0000-0000-0000-000000000001', '2024-01-20', 'note', 'Consultation initiale - évaluation profil PEQ travailleurs', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000001', '2024-02-15', 'status_change', 'Dossier passé en préparation', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000001', '2024-03-05', 'form_update', 'IMM 5476 rempli - représentant désigné', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '2024-02-01', 'note', 'Ouverture dossier d''asile - récit initial recueilli', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', '2024-02-16', 'form_update', 'Formulaire FDA (BOC) complété et soumis à la CISR', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', '2024-03-05', 'status_change', 'Tous les formulaires remplis - en attente audience', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', '2024-03-12', 'document', 'Preuves documentaires reçues du Sénégal', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000003', '2024-03-08', 'status_change', 'Demande PTPD soumise en ligne à IRCC', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000004', '2023-12-15', 'status_change', 'Dossier RP soumis à IRCC', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000004', '2024-02-20', 'ircc_update', 'Accusé de réception (ARC) reçu d''IRCC', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000004', '2024-03-10', 'document', 'Examen médical complété chez le médecin désigné', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000005', '2024-02-10', 'note', 'Première consultation - évaluation profil Entrée express', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000005', '2024-03-15', 'note', 'En attente des résultats TEF et de l''ECA de WES', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000006', '2024-03-01', 'note', 'Ouverture dossier citoyenneté - calcul présence physique', '00000000-0000-0000-0000-000000000003');

-- ============ APPOINTMENTS ============
INSERT INTO appointments (client_id, case_id, user_id, title, date, time, duration, type, status, notes) VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Suivi PEQ - Documents manquants', '2024-03-18', '10:00', 30, 'suivi', 'planifie', 'Vérifier relevés emploi et attestation MIFI'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Préparation audience CISR', '2024-03-19', '14:00', 90, 'preparation_entrevue', 'confirme', 'Revoir le narratif FDA'),
  ('10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Consultation EE - Résultats TEF', '2024-03-20', '09:30', 60, 'consultation_initiale', 'planifie', 'Analyser résultats TEF'),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Signature documents RP', '2024-03-21', '11:00', 45, 'signature', 'planifie', 'Signer les formulaires finaux'),
  ('10000000-0000-0000-0000-000000000006', NULL, '00000000-0000-0000-0000-000000000002', 'Consultation initiale - Permis d''études', '2024-03-22', '15:00', 60, 'consultation_initiale', 'planifie', 'Évaluation profil'),
  ('10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Révision formulaire citoyenneté', '2024-03-25', '10:00', 45, 'revision_formulaires', 'planifie', 'Vérifier calcul jours de présence');
