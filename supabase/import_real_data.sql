-- ============================================================================
-- IMPORT DES VRAIES DONNÉES OPTIMIS (depuis Lovable Cloud → nouveau Supabase)
-- À exécuter sur : https://supabase.com/dashboard/project/iuuefrxcmrcdbbuyzhqf/sql/new
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. PURGE des seeds démo (4 clients démo + leurs orders/invoices)
-- ----------------------------------------------------------------------------
TRUNCATE admin_invoice_lines, admin_invoices, admin_order_lines, admin_orders, admin_clients, admin_products, admin_company_settings RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 2. admin_company_settings (1 ligne)
-- ----------------------------------------------------------------------------
INSERT INTO admin_company_settings (id, company_name, contact_email, contact_phone, address_line1, address_line2, city, postal_code, country, iban_qr, default_vat_rate, payment_terms_days, invoice_footer, logo_url, vat_number, created_at, updated_at) VALUES
('3781d1b1-de4d-4183-b122-f74e82e38d67', 'OptimisLink Sàrl', 'lesiteoptimis@gmail.com', '+41 78 212 23 60', 'Place de la Fontaine 9', NULL, 'Collombey', '1868', 'CH', 'CH240021521522319901F', 8.1, 2, 'Merci pour votre confiance.', 'https://phshmvklhwpihayanhpf.supabase.co/storage/v1/object/public/company-assets/logo/company-1777194297155.svg', NULL, '2026-04-20T10:34:59.210945+00:00', '2026-04-26T12:46:53.631095+00:00');

-- ----------------------------------------------------------------------------
-- 3. admin_products (9 lignes)
-- ----------------------------------------------------------------------------
INSERT INTO admin_products (id, name, domain, currency, unit_price, avg_cpl, fx_rate_to_chf, image_url, is_active, created_at, updated_at) VALUES
('392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_maladie', 'CHF', 50, 15, 1, NULL, true, '2026-04-26T09:06:50.724391+00:00', '2026-04-26T09:06:50.724391+00:00'),
('bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'hypotheque', 'CHF', 150, 35, 1, NULL, true, '2026-04-26T09:07:34.700375+00:00', '2026-04-26T09:07:34.700375+00:00'),
('afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'telecom', 'CAD', 10, 1.5, 0.58, NULL, true, '2026-04-26T09:08:15.606269+00:00', '2026-04-27T11:57:40.468842+00:00'),
('d9fa2bcd-12d9-4a74-b8a4-e07e2a281cad', 'Leads indépendant', 'assurance_non_vie', 'CHF', 60, 20, 1, NULL, true, '2026-05-04T11:25:37.989691+00:00', '2026-05-04T11:25:37.989691+00:00'),
('07564b69-1f21-4528-b13e-814b528fb6de', 'Leads Voiture', 'assurance_non_vie', 'CHF', 50, 20, 1, NULL, true, '2026-05-04T11:28:44.927339+00:00', '2026-05-04T11:28:44.927339+00:00'),
('b8e4b80c-00a8-452a-8c32-8934b6b98d5c', 'Leads protection juridique', 'assurance_non_vie', 'CHF', 50, 20, 1, NULL, true, '2026-05-04T11:29:04.169053+00:00', '2026-05-04T11:29:04.169053+00:00'),
('57490fc4-d655-4daf-8f7e-f7a16468605d', 'Leads prévoyance', 'assurance_vie', 'CHF', 80, 20, 1, NULL, true, '2026-05-04T11:29:31.2848+00:00', '2026-05-04T11:29:31.2848+00:00'),
('ae7e8642-5cbc-44b6-af41-ec6525d595ee', 'Leads Libre passage LPP', 'lpp', 'CHF', 50, 15, 1, NULL, true, '2026-04-26T09:07:10.307698+00:00', '2026-05-18T14:09:20.062106+00:00'),
('45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'assurance_maladie', 'CHF', 25, 10, 1, NULL, true, '2026-04-26T09:07:51.672145+00:00', '2026-05-18T14:09:40.799589+00:00');

-- ----------------------------------------------------------------------------
-- 4. admin_clients (10 lignes)
-- ----------------------------------------------------------------------------
INSERT INTO admin_clients (id, company_name, contact_name, email, phone, address, status, notes, created_at, updated_at) VALUES
('162ab4ef-ae47-4bf8-b7bf-581d94f559d9', 'Yani Ait Hamadouche', 'Yani Ait Hamadouche', 'yayaait91@gmail.com', '+33769058777', '', 'actif', '', '2026-04-26T12:40:33.076341+00:00', '2026-04-26T12:40:33.076341+00:00'),
('1b309838-d892-40f9-a008-5726e9ccd3a2', 'CourtInvests', 'Alain Charriere', 'info@courtinvest.ch', '+41 79 230 59 03', 'Rue de Jéricho 30 1630 Bulle', 'actif', '', '2026-04-26T13:33:27.034591+00:00', '2026-04-26T13:33:27.034591+00:00'),
('dbe3bf94-550e-494e-b683-4cdd3f17f9bc', 'JCG Consulting Sàrl', 'Lucas Champagnac', 'lchampagnac@jcg-consulting.ch', '+41 78 312 53 58', 'Place de l''Industrie 2 1180 Rolle', 'actif', '', '2026-04-26T13:35:15.417688+00:00', '2026-04-26T13:35:15.417688+00:00'),
('285aef92-a4be-44b0-b6c6-cf869ccb61cc', 'Suisse Conseils', 'Slobozenco Maxim', 'suisseconseilsmanagement@gmail.com', 'Slobozenco Maxim', 'Av. Rosemont 12, 1208 Genève', 'actif', '', '2026-04-26T13:38:31.26309+00:00', '2026-04-26T13:38:31.26309+00:00'),
('de722f2b-feae-400c-8b1e-b0c91cfb6698', 'VERT TELECOM INC', 'Abdel Agharbi', 'info@obout.ca', '', '3 PLACE MARIE H3B2E3 MONTREAL, QUEBEC', 'actif', '', '2026-04-26T13:39:26.678545+00:00', '2026-04-26T13:39:26.678545+00:00'),
('9aff0015-8484-4191-b31f-de1204739fe8', 'e-Advisy', 'Habib Agharbi', 'hello@e-advisy.ch', '078 212 23 60', '', 'actif', '', '2026-05-01T15:36:24.397746+00:00', '2026-05-01T15:36:24.397746+00:00'),
('f9ffe340-35a0-474b-bca7-1ebb47b7fb60', 'JA Conseils', 'Jihad Abbas', 'contact@ja-conseils.ch', '076 297 63 02', '', 'actif', '', '2026-05-04T11:20:19.291631+00:00', '2026-05-04T11:20:19.291631+00:00'),
('57093226-b193-46c2-8865-eda1d40b11a9', 'GS Consulting Salerno', 'Giovanni Salerno', '', '079 240 31 01', 'Rue du Puits-Godet 10a 2000 Neuchâtel', 'actif', '', '2026-05-13T09:50:13.290912+00:00', '2026-05-13T09:50:13.290912+00:00'),
('c0bd1f80-924b-402c-ba61-9f17b2c75b4b', 'Projexion Conseil Sàrl', 'Loic Saxod', 'loic.saxod@projexion.ch', '+41 79 362 12 12', 'Route de Crassier 15, 1262 Eysins', 'actif', '', '2026-05-19T14:30:23.693121+00:00', '2026-05-19T14:30:23.693121+00:00'),
('28ac221f-99b1-478b-86b9-9ba8b3036d74', 'Achouri Consulting', 'Ilies Achouri', 'achouriconsulting@gmail.com', '079 483 13 79', '', 'actif', '', '2026-05-21T07:46:05.890032+00:00', '2026-05-21T07:46:05.890032+00:00');

-- ----------------------------------------------------------------------------
-- 5. admin_orders (12 lignes)
-- Note: invoice_id sera mis APRÈS l'insertion des invoices (FK circulaire)
-- ----------------------------------------------------------------------------
INSERT INTO admin_orders (id, client_id, order_date, order_number, invoice_id, created_at, updated_at) VALUES
('1cee02a9-0691-42cd-a457-116339eb64c6', '162ab4ef-ae47-4bf8-b7bf-581d94f559d9', '2026-04-26', 'CMD-2026-00003', NULL, '2026-04-26T13:23:20.005352+00:00', '2026-04-26T13:24:08.799795+00:00'),
('65d81732-df93-4f0c-b506-114ece410d49', '1b309838-d892-40f9-a008-5726e9ccd3a2', '2026-04-01', 'CMD-2026-00004', NULL, '2026-04-27T11:43:03.010713+00:00', '2026-04-27T11:43:09.435771+00:00'),
('f0f2221c-5007-431b-9acb-b6756bc1c604', '285aef92-a4be-44b0-b6c6-cf869ccb61cc', '2026-04-23', 'CMD-2026-00005', NULL, '2026-04-27T11:43:28.303675+00:00', '2026-04-27T11:43:40.244782+00:00'),
('c755f08e-dd0f-47a2-871e-1293f8217d5a', 'de722f2b-feae-400c-8b1e-b0c91cfb6698', '2026-04-27', 'CMD-2026-00007', NULL, '2026-04-27T11:45:59.202067+00:00', '2026-04-27T11:46:22.174657+00:00'),
('402651a0-7cbd-4f2d-aa08-3f66389e0c97', '1b309838-d892-40f9-a008-5726e9ccd3a2', '2026-04-27', 'CMD-2026-00008', NULL, '2026-04-27T11:48:06.242699+00:00', '2026-04-27T11:48:17.173245+00:00'),
('a8a11b02-4f31-456d-bfdf-31d76e9c7bc7', '1b309838-d892-40f9-a008-5726e9ccd3a2', '2026-05-01', 'CMD-2026-00009', NULL, '2026-05-01T10:45:49.423225+00:00', '2026-05-01T10:46:26.138052+00:00'),
('cb5d917f-5171-4910-92bb-8be41744fadb', 'de722f2b-feae-400c-8b1e-b0c91cfb6698', '2026-05-01', 'CMD-2026-00010', NULL, '2026-05-01T10:47:53.838851+00:00', '2026-05-04T11:23:37.769519+00:00'),
('f45ee4a4-bbb5-414d-9c2a-fe4ca116a79b', 'f9ffe340-35a0-474b-bca7-1ebb47b7fb60', '2026-05-08', 'CMD-2026-00011', NULL, '2026-05-08T18:47:54.21658+00:00', '2026-05-08T18:48:09.436737+00:00'),
('16f8de44-2c11-4e98-b76d-9c267fbfd6cf', '57093226-b193-46c2-8865-eda1d40b11a9', '2026-05-13', 'CMD-2026-00012', NULL, '2026-05-13T09:51:02.14792+00:00', '2026-05-13T09:51:11.806148+00:00'),
('b629b6b2-1bb8-432d-9f9c-91ef69a18dd3', '285aef92-a4be-44b0-b6c6-cf869ccb61cc', '2026-05-19', 'CMD-2026-00013', NULL, '2026-05-19T15:40:00.704701+00:00', '2026-05-19T15:40:05.868641+00:00'),
('0f187b0c-b076-4589-956b-2d1d851a9221', 'c0bd1f80-924b-402c-ba61-9f17b2c75b4b', '2026-05-19', 'CMD-2026-00014', NULL, '2026-05-19T15:41:53.305414+00:00', '2026-05-19T15:41:53.305414+00:00'),
('4aa7c00d-2efd-4690-a6aa-30f7ef10cd35', '28ac221f-99b1-478b-86b9-9ba8b3036d74', '2026-05-21', 'CMD-2026-00015', NULL, '2026-05-21T12:54:28.609365+00:00', '2026-05-21T12:55:20.284148+00:00');

-- ----------------------------------------------------------------------------
-- 6. admin_invoices (11 lignes)
-- ----------------------------------------------------------------------------
INSERT INTO admin_invoices (id, client_id, invoice_number, invoice_date, due_date, status, currency, fx_rate_to_chf, subtotal, vat_amount, vat_rate, total, notes, paid_at, created_at, updated_at) VALUES
('938de48b-5253-4fc4-8c7b-51a2bcf39cf6', '162ab4ef-ae47-4bf8-b7bf-581d94f559d9', 'OPT-2026-01007', '2026-04-26', '2026-04-28', 'payee', 'CHF', 1, 1875, 165, 8.8, 2040, NULL, '2026-04-26T13:24:17.616+00:00', '2026-04-26T13:24:08.456331+00:00', '2026-04-26T13:24:17.804515+00:00'),
('5e1f8e4c-513b-47a0-8097-fa586f14ac7f', '285aef92-a4be-44b0-b6c6-cf869ccb61cc', 'OPT-2026-01009', '2026-04-27', '2026-04-29', 'payee', 'CHF', 1, 2500, 202.5, 8.1, 2702.5, NULL, '2026-04-27T11:43:47.11+00:00', '2026-04-27T11:43:40.075061+00:00', '2026-04-27T11:43:47.247787+00:00'),
('2961f4d0-0d48-44aa-9bfe-de3a4582bb30', '1b309838-d892-40f9-a008-5726e9ccd3a2', 'OPT-2026-01008', '2026-04-27', '2026-04-29', 'payee', 'CHF', 1, 3000, 243, 8.1, 3243, NULL, '2026-04-27T11:43:48.63+00:00', '2026-04-27T11:43:09.225355+00:00', '2026-04-27T11:43:48.771126+00:00'),
('84290005-c2a9-4a59-b3b0-807ff5254bf1', 'de722f2b-feae-400c-8b1e-b0c91cfb6698', 'OPT-2026-01010', '2026-04-27', '2026-04-29', 'payee', 'CAD', 0.58, 5350, 0, 0, 5350, 'Pas de tva', '2026-04-27T11:58:39.89+00:00', '2026-04-27T11:46:21.840596+00:00', '2026-04-27T11:58:40.031507+00:00'),
('6c4cbc3a-033b-4057-b2fa-f3550fe72de2', '1b309838-d892-40f9-a008-5726e9ccd3a2', 'OPT-2026-01011', '2026-04-27', '2026-04-29', 'payee', 'CHF', 1, 750, 60.75, 8.1, 810.75, NULL, '2026-04-27T11:58:42.207+00:00', '2026-04-27T11:48:17.025777+00:00', '2026-04-27T11:58:42.343358+00:00'),
('a6c77575-053a-4e24-81cc-e1515f28cf35', 'de722f2b-feae-400c-8b1e-b0c91cfb6698', 'OPT-2026-01016', '2026-05-04', '2026-05-06', 'envoyee', 'CAD', 0.58, 5000, 0, 0, 5000, 'Pas de TVA', NULL, '2026-05-04T11:23:37.567794+00:00', '2026-05-04T11:24:58.848203+00:00'),
('443908cf-510f-41ff-80b6-cfcfad2254e3', '1b309838-d892-40f9-a008-5726e9ccd3a2', 'OPT-2026-01012', '2026-05-01', '2026-05-03', 'payee', 'CHF', 1, 3000, 243, 8.1, 3243, NULL, '2026-05-07T07:55:18.826+00:00', '2026-05-01T10:46:25.809747+00:00', '2026-05-07T07:55:18.936262+00:00'),
('e48011b4-d40f-42ef-beb1-35dbda6ccba6', 'f9ffe340-35a0-474b-bca7-1ebb47b7fb60', 'OPT-2026-01017', '2026-05-08', '2026-05-10', 'payee', 'CHF', 1, 2000, 162, 8.1, 2162, NULL, '2026-05-11T12:49:52.389+00:00', '2026-05-08T18:48:08.458925+00:00', '2026-05-11T12:49:54.529525+00:00'),
('7586d4fa-8d0c-4f4d-9a9e-96a0e69ad538', '57093226-b193-46c2-8865-eda1d40b11a9', 'OPT-2026-01018', '2026-05-13', '2026-05-15', 'payee', 'CHF', 1, 3350, 271.35, 8.1, 3621.35, NULL, '2026-05-16T16:37:28.006+00:00', '2026-05-13T09:51:11.538127+00:00', '2026-05-16T16:37:28.219593+00:00'),
('1d754c97-46bc-402e-9870-796473b5855c', '28ac221f-99b1-478b-86b9-9ba8b3036d74', 'OPT-2026-01020', '2026-05-21', '2026-05-23', 'envoyee', 'CHF', 1, 2500, 202.5, 8.1, 2702.5, NULL, NULL, '2026-05-21T12:55:20.007078+00:00', '2026-05-21T12:55:27.247787+00:00'),
('29e645df-4efb-47ca-bb27-a1420f7ad531', '285aef92-a4be-44b0-b6c6-cf869ccb61cc', 'OPT-2026-01019', '2026-05-19', '2026-05-21', 'payee', 'CHF', 1, 2500, 202.5, 8.1, 2702.5, NULL, '2026-05-25T07:23:46.695+00:00', '2026-05-19T15:40:05.660041+00:00', '2026-05-25T07:23:46.805261+00:00');

-- ----------------------------------------------------------------------------
-- 7. UPDATE admin_orders.invoice_id (FK vers invoices, maintenant qu'elles existent)
-- ----------------------------------------------------------------------------
UPDATE admin_orders SET invoice_id = '938de48b-5253-4fc4-8c7b-51a2bcf39cf6' WHERE id = '1cee02a9-0691-42cd-a457-116339eb64c6';
UPDATE admin_orders SET invoice_id = '2961f4d0-0d48-44aa-9bfe-de3a4582bb30' WHERE id = '65d81732-df93-4f0c-b506-114ece410d49';
UPDATE admin_orders SET invoice_id = '5e1f8e4c-513b-47a0-8097-fa586f14ac7f' WHERE id = 'f0f2221c-5007-431b-9acb-b6756bc1c604';
UPDATE admin_orders SET invoice_id = '84290005-c2a9-4a59-b3b0-807ff5254bf1' WHERE id = 'c755f08e-dd0f-47a2-871e-1293f8217d5a';
UPDATE admin_orders SET invoice_id = '6c4cbc3a-033b-4057-b2fa-f3550fe72de2' WHERE id = '402651a0-7cbd-4f2d-aa08-3f66389e0c97';
UPDATE admin_orders SET invoice_id = '443908cf-510f-41ff-80b6-cfcfad2254e3' WHERE id = 'a8a11b02-4f31-456d-bfdf-31d76e9c7bc7';
UPDATE admin_orders SET invoice_id = 'a6c77575-053a-4e24-81cc-e1515f28cf35' WHERE id = 'cb5d917f-5171-4910-92bb-8be41744fadb';
UPDATE admin_orders SET invoice_id = 'e48011b4-d40f-42ef-beb1-35dbda6ccba6' WHERE id = 'f45ee4a4-bbb5-414d-9c2a-fe4ca116a79b';
UPDATE admin_orders SET invoice_id = '7586d4fa-8d0c-4f4d-9a9e-96a0e69ad538' WHERE id = '16f8de44-2c11-4e98-b76d-9c267fbfd6cf';
UPDATE admin_orders SET invoice_id = '29e645df-4efb-47ca-bb27-a1420f7ad531' WHERE id = 'b629b6b2-1bb8-432d-9f9c-91ef69a18dd3';
UPDATE admin_orders SET invoice_id = '1d754c97-46bc-402e-9870-796473b5855c' WHERE id = '4aa7c00d-2efd-4690-a6aa-30f7ef10cd35';

-- ----------------------------------------------------------------------------
-- 8. admin_order_lines (17 lignes) — line_total EXCLUE car GENERATED
-- ----------------------------------------------------------------------------
INSERT INTO admin_order_lines (id, order_id, product_id, product_name, category, subcategory, domain, currency, quantity, unit_price, fx_rate_to_chf, position, comment, created_at) VALUES
('29241934-e077-4481-a641-f2a810416b8b', '1cee02a9-0691-42cd-a457-116339eb64c6', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 25, 50, 1, 0, NULL, '2026-04-26T13:23:20.487846+00:00'),
('35aa6370-991f-47ae-ac45-873d2cdc0d86', '1cee02a9-0691-42cd-a457-116339eb64c6', '45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 25, 25, 1, 1, NULL, '2026-04-26T13:23:20.487846+00:00'),
('a20ff708-731c-4d79-8907-0c0ab678a954', '65d81732-df93-4f0c-b506-114ece410d49', 'bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'assurance_finances', 'hypotheque', 'hypotheque', 'CHF', 20, 150, 1, 0, NULL, '2026-04-27T11:43:03.143264+00:00'),
('fdb18ae0-3ba8-4e58-b578-dc100a3ecb5c', 'f0f2221c-5007-431b-9acb-b6756bc1c604', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 50, 50, 1, 0, NULL, '2026-04-27T11:43:28.367746+00:00'),
('6b0d2ea6-15bd-4a02-a64e-6179943fc25d', 'c755f08e-dd0f-47a2-871e-1293f8217d5a', 'afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'telecom', 'telecom', 'telecom', 'CAD', 500, 10, 0.58, 0, NULL, '2026-04-27T11:45:59.544634+00:00'),
('9088f060-ba3b-4e43-861b-7ea2eb7bdf6a', 'c755f08e-dd0f-47a2-871e-1293f8217d5a', 'afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'telecom', 'telecom', 'telecom', 'CAD', 10, 35, 0.58, 1, NULL, '2026-04-27T11:45:59.544634+00:00'),
('11350980-38c7-4a61-a7a5-f06f1bde484c', '402651a0-7cbd-4f2d-aa08-3f66389e0c97', 'bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'assurance_finances', 'hypotheque', 'hypotheque', 'CHF', 5, 150, 1, 0, NULL, '2026-04-27T11:48:06.351778+00:00'),
('3d158693-f370-4a77-87ba-a8c525478f9d', 'a8a11b02-4f31-456d-bfdf-31d76e9c7bc7', 'bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'assurance_finances', 'hypotheque', 'hypotheque', 'CHF', 20, 150, 1, 0, NULL, '2026-05-01T10:45:49.577764+00:00'),
('bebf96f9-27ae-4ce8-ac64-92ce7fb35fd5', 'cb5d917f-5171-4910-92bb-8be41744fadb', 'afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'telecom', 'telecom', 'telecom', 'CAD', 500, 10, 0.58, 0, NULL, '2026-05-01T10:47:53.946557+00:00'),
('ae8959b0-1405-4f44-b10c-b70683083b85', 'f45ee4a4-bbb5-414d-9c2a-fe4ca116a79b', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 15, 50, 1, 0, NULL, '2026-05-08T18:47:54.411144+00:00'),
('767dd182-61ae-449b-a56d-2423b057ae79', 'f45ee4a4-bbb5-414d-9c2a-fe4ca116a79b', '45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 50, 25, 1, 1, NULL, '2026-05-08T18:47:54.411144+00:00'),
('06c25365-ea6b-4b92-83a8-b898025580d9', '16f8de44-2c11-4e98-b76d-9c267fbfd6cf', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 55, 50, 1, 0, NULL, '2026-05-13T09:51:02.28613+00:00'),
('c41c7503-e740-42c5-942a-a46d2d9e4000', '16f8de44-2c11-4e98-b76d-9c267fbfd6cf', 'ae7e8642-5cbc-44b6-af41-ec6525d595ee', 'Leads Libre passage LPP', 'assurance_finances', 'lpp', 'lpp', 'CHF', 15, 40, 1, 1, NULL, '2026-05-13T09:51:02.28613+00:00'),
('afa57f2d-0138-4880-b609-51114af5a624', 'b629b6b2-1bb8-432d-9f9c-91ef69a18dd3', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 50, 50, 1, 0, NULL, '2026-05-19T15:40:00.824867+00:00'),
('4cd5ecea-bb82-4984-8f6d-657a9c48f5e5', '0f187b0c-b076-4589-956b-2d1d851a9221', 'd9fa2bcd-12d9-4a74-b8a4-e07e2a281cad', 'Leads indépendant', 'assurance_finances', 'assurance_non_vie', 'assurance_non_vie', 'CHF', 40, 60, 1, 0, NULL, '2026-05-19T15:41:53.382091+00:00'),
('2e0b1188-b71a-49b4-b5be-dca457f9de0e', '4aa7c00d-2efd-4690-a6aa-30f7ef10cd35', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 35, 50, 1, 0, NULL, '2026-05-21T12:54:28.725644+00:00'),
('23850032-4e26-40a3-b98f-dc6debf2dca0', '4aa7c00d-2efd-4690-a6aa-30f7ef10cd35', '45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'assurance_finances', 'assurance_maladie', 'assurance_maladie', 'CHF', 30, 25, 1, 1, NULL, '2026-05-21T12:54:28.725644+00:00');

-- ----------------------------------------------------------------------------
-- 9. admin_invoice_lines (16 lignes) — line_total EXCLUE car GENERATED
-- ----------------------------------------------------------------------------
INSERT INTO admin_invoice_lines (id, invoice_id, product_id, product_name, description, category, subcategory, quantity, unit_price, position, created_at) VALUES
('bd6502b5-ee66-48ac-b8ef-3827f67b5357', '938de48b-5253-4fc4-8c7b-51a2bcf39cf6', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'Assurance / Finances › Assurance maladie › Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 25, 50, 0, '2026-04-26T13:24:08.641866+00:00'),
('3cb98be5-ec70-4f52-88bd-5b3c16de83ae', '938de48b-5253-4fc4-8c7b-51a2bcf39cf6', '45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'Assurance / Finances › Assurance maladie › Leads subside', 'assurance_finances', 'assurance_maladie', 25, 25, 1, '2026-04-26T13:24:08.641866+00:00'),
('7e96a629-1a34-408d-91fa-9362d21d2918', '2961f4d0-0d48-44aa-9bfe-de3a4582bb30', 'bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'Assurance / Finances › Hypothèque › Leads hypothèque', 'assurance_finances', 'hypotheque', 20, 150, 0, '2026-04-27T11:43:09.332877+00:00'),
('e0a5c7fb-f4b7-403b-a7ea-03b4ae59ee94', '5e1f8e4c-513b-47a0-8097-fa586f14ac7f', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'Assurance / Finances › Assurance maladie › Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 50, 50, 0, '2026-04-27T11:43:40.149018+00:00'),
('3c1434aa-8528-4aba-b548-3691c93213ae', '84290005-c2a9-4a59-b3b0-807ff5254bf1', 'afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'Télécom › Forfait télécom › Leads telecom', 'telecom', 'telecom', 500, 10, 0, '2026-04-27T11:46:22.019424+00:00'),
('dfdb8abc-e18d-409a-ba06-4f8a500350d0', '84290005-c2a9-4a59-b3b0-807ff5254bf1', 'afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'Télécom › Forfait télécom › Leads telecom', 'telecom', 'telecom', 10, 35, 1, '2026-04-27T11:46:22.019424+00:00'),
('c49ed968-b24a-45ad-bf66-c5a33b8d156d', '6c4cbc3a-033b-4057-b2fa-f3550fe72de2', 'bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'Assurance / Finances › Hypothèque › Leads hypothèque', 'assurance_finances', 'hypotheque', 5, 150, 0, '2026-04-27T11:48:17.087053+00:00'),
('6cd0af6d-ea9c-4393-8818-ecda9e784d92', '443908cf-510f-41ff-80b6-cfcfad2254e3', 'bfddbdbd-9371-4e66-846c-66431074720c', 'Leads hypothèque', 'Assurance / Finances › Hypothèque › Leads hypothèque', 'assurance_finances', 'hypotheque', 20, 150, 0, '2026-05-01T10:46:25.966995+00:00'),
('713857da-5f5d-4073-acf9-11130be77aad', 'a6c77575-053a-4e24-81cc-e1515f28cf35', 'afa877b6-7ffc-41fe-9a68-0043a0b6d122', 'Leads telecom', 'Télécom › Forfait télécom › Leads telecom', 'telecom', 'telecom', 500, 10, 0, '2026-05-04T11:23:37.683968+00:00'),
('4ce8beca-3b5e-4641-861d-99e7778da6bb', 'e48011b4-d40f-42ef-beb1-35dbda6ccba6', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'Assurance / Finances › Assurance maladie › Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 15, 50, 0, '2026-05-08T18:48:08.621623+00:00'),
('ffe42691-322f-4f4d-8a06-4691694c5d53', 'e48011b4-d40f-42ef-beb1-35dbda6ccba6', '45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'Assurance / Finances › Assurance maladie › Leads subside', 'assurance_finances', 'assurance_maladie', 50, 25, 1, '2026-05-08T18:48:08.621623+00:00'),
('4cf7150c-2c47-4946-9373-7b36ca8afab6', '7586d4fa-8d0c-4f4d-9a9e-96a0e69ad538', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'Assurance / Finances › Assurance maladie › Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 55, 50, 0, '2026-05-13T09:51:11.669822+00:00'),
('3d6457f5-54f8-4309-ac44-7a5df0c777b9', '7586d4fa-8d0c-4f4d-9a9e-96a0e69ad538', 'ae7e8642-5cbc-44b6-af41-ec6525d595ee', 'Leads Libre passage LPP', 'Assurance / Finances › LPP › Leads Libre passage LPP', 'assurance_finances', 'lpp', 15, 40, 1, '2026-05-13T09:51:11.669822+00:00'),
('e1e12ce4-2fd5-4510-b32d-dca6e844c92c', '29e645df-4efb-47ca-bb27-a1420f7ad531', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'Assurance / Finances › Assurance maladie › Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 50, 50, 0, '2026-05-19T15:40:05.76049+00:00'),
('a9e9a6b5-d5a5-4e27-9924-385d46e78d01', '1d754c97-46bc-402e-9870-796473b5855c', '392991e2-1bed-4df7-b0d7-fbb5e52ce0de', 'Leads assurance maladie', 'Assurance / Finances › Assurance maladie › Leads assurance maladie', 'assurance_finances', 'assurance_maladie', 35, 50, 0, '2026-05-21T12:55:20.135179+00:00'),
('ace16827-5132-4e85-b693-0eb5546d5867', '1d754c97-46bc-402e-9870-796473b5855c', '45dafee9-77c2-4afa-bc75-04aa27ce0096', 'Leads subside', 'Assurance / Finances › Assurance maladie › Leads subside', 'assurance_finances', 'assurance_maladie', 30, 25, 1, '2026-05-21T12:55:20.135179+00:00');

COMMIT;

-- ----------------------------------------------------------------------------
-- VÉRIFICATION (à exécuter séparément après le COMMIT)
-- ----------------------------------------------------------------------------
-- SELECT 'admin_company_settings' AS table_name, count(*) FROM admin_company_settings
-- UNION ALL SELECT 'admin_products', count(*) FROM admin_products
-- UNION ALL SELECT 'admin_clients', count(*) FROM admin_clients
-- UNION ALL SELECT 'admin_orders', count(*) FROM admin_orders
-- UNION ALL SELECT 'admin_order_lines', count(*) FROM admin_order_lines
-- UNION ALL SELECT 'admin_invoices', count(*) FROM admin_invoices
-- UNION ALL SELECT 'admin_invoice_lines', count(*) FROM admin_invoice_lines;
-- Résultat attendu : 1, 9, 10, 12, 17, 11, 16
