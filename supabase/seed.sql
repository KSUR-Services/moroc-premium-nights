-- ============================================================
-- MOROC PREMIUM NIGHTS — Seed Data
-- Premium nightlife & dining directory for Morocco
-- ============================================================

BEGIN;

-- ============================================================
-- CITIES
-- ============================================================
INSERT INTO cities (name, slug, description, hero_image_url, latlng) VALUES
  ('Casablanca', 'casablanca',
   'Morocco''s economic capital pulses with energy after dark. From the glittering corniche to the art-deco downtown, Casablanca offers a nightlife scene that rivals any Mediterranean city.',
   '/images/cities/casablanca-hero.jpg',
   ST_MakePoint(-7.5898, 33.5731)::geography),

  ('Rabat', 'rabat',
   'The royal capital blends imperial grandeur with a refined evening culture. Rabat''s dining and lounge scene is intimate, sophisticated, and full of hidden gems along the Bouregreg river.',
   '/images/cities/rabat-hero.jpg',
   ST_MakePoint(-6.8416, 34.0209)::geography),

  ('Tangier', 'tangier',
   'Perched on the Strait of Gibraltar, Tangier has seduced artists and jet-setters for over a century. Its reborn medina and seafront terraces deliver sunsets you won''t forget.',
   '/images/cities/tangier-hero.jpg',
   ST_MakePoint(-5.8340, 35.7595)::geography),

  ('Marrakech', 'marrakech',
   'The Red City is Morocco''s undisputed nightlife capital. From rooftop cocktails overlooking the Koutoubia to legendary clubs in the Hivernage district, Marrakech never sleeps.',
   '/images/cities/marrakech-hero.jpg',
   ST_MakePoint(-7.9811, 31.6295)::geography);


-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, priority) VALUES
  ('Restaurants', 'restaurants', 1),
  ('Lounges & Rooftop Bars', 'lounges-rooftop-bars', 2),
  ('Nightclubs', 'nightclubs', 3),
  ('Beach Clubs', 'beach-clubs', 4);


-- ============================================================
-- TAGS
-- ============================================================
INSERT INTO tags (name, slug) VALUES
  ('Live DJ', 'live-dj'),
  ('Shisha', 'shisha'),
  ('Sea View', 'sea-view'),
  ('Rooftop', 'rooftop'),
  ('Terrace', 'terrace'),
  ('Pool', 'pool'),
  ('Valet Parking', 'valet-parking'),
  ('Reservation Required', 'reservation-required'),
  ('Halal', 'halal'),
  ('Wine Bar', 'wine-bar'),
  ('Cocktails', 'cocktails'),
  ('Live Music', 'live-music'),
  ('Karaoke', 'karaoke'),
  ('Dance Floor', 'dance-floor'),
  ('VIP Area', 'vip-area'),
  ('Garden', 'garden'),
  ('Waterfront', 'waterfront'),
  ('Brunch', 'brunch'),
  ('Late Night', 'late-night'),
  ('Date Night', 'date-night'),
  ('Group Friendly', 'group-friendly'),
  ('Business Dining', 'business-dining'),
  ('Family Friendly', 'family-friendly'),
  ('Pet Friendly', 'pet-friendly'),
  ('Outdoor Seating', 'outdoor-seating'),
  ('Private Rooms', 'private-rooms'),
  ('Sports Screening', 'sports-screening'),
  ('Happy Hour', 'happy-hour'),
  ('Dress Code Strict', 'dress-code-strict'),
  ('Women Friendly', 'women-friendly');


-- ============================================================
-- VENUES — CASABLANCA  (city_id = 1)
-- ============================================================
INSERT INTO venues (city_id, category_id, name, slug, neighborhood, address, latlng, whatsapp, phone, instagram, website, price_range, dress_code, music_style, age_policy, alcohol_policy, attributes, status, is_sponsored, priority_score, internal_notes) VALUES
-- 1. Sky 28 (Lounge)
(1, 2, 'Sky 28', 'sky-28', 'Centre-Ville', 'Kenzi Tower Hotel, Bd Zerktouni, Casablanca 20000', ST_MakePoint(-7.6200, 33.5950)::geography, '+212522458888', '+212522458800', '@sky28casa', 'https://sky28.ma', '€€€€', 'Smart elegant', 'Deep house / Lounge', '21+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "capacity": 200}', 'published', true, 95, 'Flagship partner — renewed contract Q1 2026'),

-- 2. Le Cabestan
(1, 1, 'Le Cabestan', 'le-cabestan', 'Phare d''El Hank', '90 Bd de la Corniche, Ain Diab, Casablanca 20180', ST_MakePoint(-7.6650, 33.5930)::geography, '+212522391190', '+212522391190', '@lecabestan', 'https://lecabestan.com', '€€€€', 'Smart casual', 'Jazz / Ambient', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "capacity": 150}', 'published', true, 92, 'Iconic ocean-front spot, high-profile clientele'),

-- 3. Rick''s Cafe
(1, 1, 'Rick''s Cafe', 'ricks-cafe', 'Ancienne Médina', '248 Bd Sour Jdid, Casablanca 20000', ST_MakePoint(-7.6115, 33.6020)::geography, '+212522274207', '+212522274207', '@rickscafecasa', 'https://rickscafe.ma', '€€€', 'Smart casual', 'Live jazz / Piano', 'All ages', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "capacity": 120}', 'published', false, 88, 'Tourist magnet inspired by the movie Casablanca'),

-- 4. La Sqala
(1, 1, 'La Sqala', 'la-sqala', 'Ancienne Médina', 'Bd des Almohades, Casablanca 20000', ST_MakePoint(-7.6130, 33.6035)::geography, '+212522260960', '+212522260960', '@lasqala_casa', NULL, '€€', 'Casual', 'Traditional / Ambient', 'All ages', 'no', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "capacity": 250, "garden": true}', 'published', false, 80, 'Beautiful garden courtyard, great for brunch'),

-- 5. Blanco
(1, 2, 'Blanco', 'blanco-casa', 'Corniche', 'Bd de la Corniche, Ain Diab, Casablanca 20180', ST_MakePoint(-7.6710, 33.5910)::geography, '+212661123456', '+212522797900', '@blancocasa', 'https://blanco.ma', '€€€', 'Chic', 'House / R&B', '21+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "capacity": 300}', 'published', true, 90, 'Major weekend draw on the corniche'),

-- 6. Bazaar
(1, 1, 'Bazaar', 'bazaar-casa', 'Gauthier', 'Rue Jean Jaurès, Casablanca 20000', ST_MakePoint(-7.6190, 33.5880)::geography, '+212522221010', '+212522221010', '@bazaarcasa', 'https://bazaar-casa.com', '€€€', 'Trendy casual', 'World music / Lounge', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "capacity": 180}', 'published', false, 78, 'Eclectic decor, popular with young professionals'),

-- 7. L''Atelier de Joël Robuchon
(1, 1, 'L''Atelier de Joël Robuchon', 'latelier-joel-robuchon-casa', 'Anfa', 'Four Seasons Hotel, Bd de la Corniche, Casablanca 20050', ST_MakePoint(-7.6560, 33.5920)::geography, '+212529073700', '+212529073700', '@robuchon_casa', 'https://robuchon.ma', '€€€€', 'Formal', 'Classical / Ambient', 'All ages', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "capacity": 70, "michelin_style": true}', 'published', true, 97, 'Highest-end dining in Casa — handle with care'),

-- 8. Brasserie La Tour
(1, 1, 'Brasserie La Tour', 'brasserie-la-tour', 'Centre-Ville', '2 Rue Abou Kacem Ezayani, Casablanca 20000', ST_MakePoint(-7.6170, 33.5890)::geography, '+212522314949', '+212522314949', '@brasserielatour', 'https://brasserielatour.ma', '€€€', 'Smart casual', 'French chanson / Jazz', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "capacity": 100}', 'published', false, 72, 'Classic French brasserie atmosphere'),

-- 9. Le Petit Rocher
(1, 1, 'Le Petit Rocher', 'le-petit-rocher', 'Corniche', 'Bd de la Corniche, Casablanca 20180', ST_MakePoint(-7.6680, 33.5905)::geography, '+212522362500', '+212522362500', '@lepetitrocher', NULL, '€€€', 'Casual chic', 'Ambient', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "sea_view": true}', 'published', false, 76, 'Seafood specialist right on the rocks'),

-- 10. Ain Diab Beach Club
(1, 4, 'Ain Diab Beach Club', 'ain-diab-beach-club', 'Ain Diab', 'Plage Ain Diab, Casablanca 20180', ST_MakePoint(-7.6750, 33.5895)::geography, '+212661987654', '+212522798000', '@aindiabbeachclub', 'https://aindiabbeachclub.ma', '€€€', 'Beach chic', 'Tropical house / Afrobeat', '18+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "beach_access": true}', 'published', true, 85, 'Summer hotspot — seasonal contract May-Sep');


-- ============================================================
-- VENUES — RABAT  (city_id = 2)
-- ============================================================
INSERT INTO venues (city_id, category_id, name, slug, neighborhood, address, latlng, whatsapp, phone, instagram, website, price_range, dress_code, music_style, age_policy, alcohol_policy, attributes, status, is_sponsored, priority_score, internal_notes) VALUES
-- 1. Dar Zaki
(2, 1, 'Dar Zaki', 'dar-zaki', 'Médina', '30 Rue Sidi Fatah, Rabat 10030', ST_MakePoint(-6.8340, 34.0260)::geography, '+212537204590', '+212537204590', '@darzaki', NULL, '€€€', 'Smart casual', 'Gnawa / Traditional', 'All ages', 'no', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "riad_style": true}', 'published', false, 82, 'Authentic riad dining experience'),

-- 2. Le Dhow
(2, 2, 'Le Dhow', 'le-dhow', 'Bouregreg Marina', 'Marina Bouregreg, Salé-Rabat', ST_MakePoint(-6.8360, 34.0310)::geography, '+212537209560', '+212537209560', '@ledhow_rabat', 'https://ledhow.ma', '€€€', 'Chic', 'Lounge / Deep house', '18+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "floating_venue": true}', 'published', true, 91, 'Unique floating lounge on the Bouregreg — flagship partner'),

-- 3. Villa Mandarine
(2, 1, 'Villa Mandarine', 'villa-mandarine', 'Souissi', '19 Rue Ouled Bousbaa, Souissi, Rabat 10100', ST_MakePoint(-6.8500, 34.0100)::geography, '+212537752077', '+212537752077', '@villamandarine', 'https://villamandarine.com', '€€€€', 'Formal', 'Classical / Ambient', 'All ages', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "garden": true, "boutique_hotel": true}', 'published', true, 93, 'Luxury boutique hotel restaurant — garden setting'),

-- 4. Cosmopolitan
(2, 2, 'Cosmopolitan', 'cosmopolitan-rabat', 'Agdal', 'Av. France, Agdal, Rabat 10080', ST_MakePoint(-6.8480, 34.0150)::geography, '+212537681234', '+212537681234', '@cosmorabat', NULL, '€€€', 'Trendy', 'R&B / Hip hop', '21+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "capacity": 160}', 'published', false, 75, 'Young crowd, weekend DJ sets'),

-- 5. Paul Rabat
(2, 1, 'Paul Rabat', 'paul-rabat', 'Agdal', 'Av. Fal Ould Oumeir, Agdal, Rabat 10080', ST_MakePoint(-6.8460, 34.0140)::geography, '+212537774400', '+212537774400', '@paulrabat', 'https://paul.ma', '€€', 'Casual', 'French pop / Ambient', 'All ages', 'no', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "brunch_service": true}', 'published', false, 68, 'Reliable French bakery-restaurant chain'),

-- 6. Le Pietri
(2, 1, 'Le Pietri', 'le-pietri', 'Centre-Ville', '4 Rue Moulay Ismail, Rabat 10000', ST_MakePoint(-6.8380, 34.0200)::geography, '+212537707820', '+212537707820', '@lepietri_rabat', NULL, '€€€', 'Smart casual', 'Jazz / Bossa nova', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "art_deco_interior": true}', 'published', false, 79, 'Charming art-deco interiors, great wine list'),

-- 7. Café Maure
(2, 2, 'Café Maure', 'cafe-maure-rabat', 'Kasbah des Oudayas', 'Kasbah des Oudayas, Rabat 10030', ST_MakePoint(-6.8320, 34.0330)::geography, '+212661456789', NULL, '@cafemaure_rabat', NULL, '€€', 'Casual', 'Traditional / Silence', 'All ages', 'no', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "historic_site": true, "sea_view": true}', 'published', false, 85, 'Iconic location inside the Kasbah — no alcohol'),

-- 8. La Tour Hassan
(2, 1, 'La Tour Hassan', 'la-tour-hassan-palace', 'Centre-Ville', '26 Rue Chellah, Rabat 10000', ST_MakePoint(-6.8280, 34.0240)::geography, '+212537239000', '+212537239000', '@latourhassanpalace', 'https://latourhassan.com', '€€€€', 'Formal', 'Classical', 'All ages', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "palace_hotel": true}', 'published', true, 94, 'Palace-grade dining, state dinner level'),

-- 9. Balima
(2, 2, 'Balima', 'balima-rabat', 'Centre-Ville', 'Av. Mohammed V, Rabat 10000', ST_MakePoint(-6.8370, 34.0210)::geography, '+212537708525', '+212537708525', '@balimahotel', NULL, '€€', 'Casual', 'Retro / Lounge', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "historic_landmark": true}', 'draft', false, 55, 'Under renovation — expected relaunch mid-2026'),

-- 10. Jazz Bar Rabat
(2, 3, 'Jazz Bar Rabat', 'jazz-bar-rabat', 'Hassan', 'Rue Patrice Lumumba, Rabat 10000', ST_MakePoint(-6.8300, 34.0220)::geography, '+212537701234', '+212537701234', '@jazzbarrabat', NULL, '€€€', 'Smart casual', 'Jazz / Blues', '21+', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "live_bands": true}', 'published', false, 77, 'Intimate jazz venue, live bands Thu-Sat');


-- ============================================================
-- VENUES — TANGIER  (city_id = 3)
-- ============================================================
INSERT INTO venues (city_id, category_id, name, slug, neighborhood, address, latlng, whatsapp, phone, instagram, website, price_range, dress_code, music_style, age_policy, alcohol_policy, attributes, status, is_sponsored, priority_score, internal_notes) VALUES
-- 1. El Morocco Club
(3, 2, 'El Morocco Club', 'el-morocco-club', 'Kasbah', 'Pl. du Tabor, Kasbah, Tangier 90000', ST_MakePoint(-5.8100, 35.7870)::geography, '+212539948139', '+212539948139', '@elmoroccoclub', 'https://elmoroccoclub.com', '€€€€', 'Smart elegant', 'Jazz / World', '18+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "sea_view": true, "art_gallery": true}', 'published', true, 96, 'Tangier''s crown jewel — art + cocktails + panoramic view'),

-- 2. Nord-Pinus Tanger
(3, 2, 'Nord-Pinus Tanger', 'nord-pinus-tanger', 'Kasbah', '11 Rue du Riad Sultan, Tangier 90000', ST_MakePoint(-5.8110, 35.7880)::geography, '+212539211280', '+212539211280', '@nordpinustanger', 'https://nord-pinus-tanger.com', '€€€€', 'Chic', 'Lounge / Ambient', '18+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "boutique_hotel": true}', 'published', true, 92, 'Exclusive boutique hotel, fashion crowd favorite'),

-- 3. La Fabrique
(3, 3, 'La Fabrique', 'la-fabrique-tanger', 'Ville Nouvelle', 'Rue d''Angleterre, Tangier 90000', ST_MakePoint(-5.8070, 35.7750)::geography, '+212661334455', '+212539322000', '@lafabriquetanger', NULL, '€€€', 'Trendy', 'Techno / House', '21+', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": false, "capacity": 350, "smoke_machine": true}', 'published', false, 80, 'Main techno club in Tangier'),

-- 4. Café Hafa
(3, 2, 'Café Hafa', 'cafe-hafa', 'Marshan', 'Av. Hadi Mandri, Tangier 90000', ST_MakePoint(-5.8200, 35.7850)::geography, '+212539334020', NULL, '@cafehafa_tanger', NULL, '€€', 'Casual', 'Silence / Traditional', 'All ages', 'no', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "sea_view": true, "historic_site": true}', 'published', false, 87, 'Legendary cliff-side terraces, Rolling Stones used to come here'),

-- 5. Salon Bleu
(3, 1, 'Salon Bleu', 'salon-bleu-tanger', 'Médina', 'Rue Dar Baroud, Tangier 90000', ST_MakePoint(-5.8125, 35.7860)::geography, '+212661778899', '+212539371970', '@salonbleu_tanger', NULL, '€€', 'Casual', 'Ambient', 'All ages', 'no', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "sea_view": true}', 'published', false, 74, 'Charming blue terrace overlooking the strait'),

-- 6. Tangerinn
(3, 2, 'Tangerinn', 'tangerinn', 'Kasbah', 'Rue Magellan, Tangier 90000', ST_MakePoint(-5.8115, 35.7865)::geography, '+212539223388', '+212539223388', '@tangerinn', NULL, '€€€', 'Smart casual', 'Classic rock / Jazz', '18+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": false, "live_music": true}', 'published', false, 70, 'Inside El Muniria hotel where Burroughs wrote Naked Lunch'),

-- 7. Le Saveur de Poisson
(3, 1, 'Le Saveur de Poisson', 'le-saveur-de-poisson', 'Ville Nouvelle', '2 Rue de la Liberté, Tangier 90000', ST_MakePoint(-5.8090, 35.7760)::geography, '+212539336326', '+212539336326', '@saveurdepoisson', NULL, '€€€', 'Casual', 'None', 'All ages', 'no', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "set_menu_only": true}', 'published', false, 83, 'No menu, no choices — just the freshest fish. A Tangier institution'),

-- 8. Dar Nour
(3, 2, 'Dar Nour', 'dar-nour-tanger', 'Kasbah', '20 Rue Gourna, Kasbah, Tangier 90000', ST_MakePoint(-5.8105, 35.7875)::geography, '+212539112724', '+212539112724', '@darnourtanger', 'https://darnour.com', '€€€', 'Smart casual', 'Ambient / Chill', '18+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "sea_view": true, "riad_style": true}', 'published', false, 78, 'Intimate riad-hotel with spectacular terrace'),

-- 9. Anna & Paolo
(3, 1, 'Anna & Paolo', 'anna-paolo-tanger', 'Ville Nouvelle', '77 Rue de la Liberté, Tangier 90000', ST_MakePoint(-5.8085, 35.7755)::geography, '+212539941627', '+212539941627', '@annapaolorestaurant', NULL, '€€€', 'Smart casual', 'Italian pop / Ambient', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true}', 'published', false, 73, 'Upscale Italian, great pasta and wine list'),

-- 10. Le Nabab
(3, 1, 'Le Nabab', 'le-nabab-tanger', 'Ville Nouvelle', '4 Rue Al Moutanabi, Tangier 90000', ST_MakePoint(-5.8060, 35.7745)::geography, '+212539441643', '+212539441643', '@lenabab_tanger', NULL, '€€€', 'Smart casual', 'Oriental / Lounge', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "moroccan_cuisine": true}', 'draft', false, 60, 'Recently changed management — monitoring quality');


-- ============================================================
-- VENUES — MARRAKECH  (city_id = 4)
-- ============================================================
INSERT INTO venues (city_id, category_id, name, slug, neighborhood, address, latlng, whatsapp, phone, instagram, website, price_range, dress_code, music_style, age_policy, alcohol_policy, attributes, status, is_sponsored, priority_score, internal_notes) VALUES
-- 1. Comptoir Darna
(4, 1, 'Comptoir Darna', 'comptoir-darna', 'Hivernage', 'Av. Echouhada, Hivernage, Marrakech 40000', ST_MakePoint(-8.0100, 31.6230)::geography, '+212524437702', '+212524437702', '@comptoirdarna', 'https://comptoirdarna.com', '€€€€', 'Smart elegant', 'Oriental / Live belly dance', '18+', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "live_entertainment": true, "capacity": 300}', 'published', true, 95, 'Iconic Marrakech dinner show — top performer'),

-- 2. La Mamounia Bar
(4, 2, 'La Mamounia Bar', 'la-mamounia-bar', 'Médina', 'Av. Bab Jdid, Marrakech 40040', ST_MakePoint(-7.9950, 31.6210)::geography, '+212524388600', '+212524388600', '@lamamounia', 'https://mamounia.com', '€€€€', 'Formal', 'Jazz / Classical', '18+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "palace_hotel": true, "garden": true}', 'published', true, 98, 'Palace-level luxury, Churchill''s favorite'),

-- 3. Kabana
(4, 4, 'Kabana', 'kabana-marrakech', 'Médina', 'Riad Zitoun Jdid, Marrakech 40000', ST_MakePoint(-7.9870, 31.6240)::geography, '+212524381010', '+212524381010', '@kabanamarrakech', 'https://kabana.ma', '€€€', 'Boho chic', 'Afro house / Tribal', '18+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "rooftop": true}', 'published', true, 88, 'Rooftop pool bar, great sunset sessions'),

-- 4. Le Jardin
(4, 1, 'Le Jardin', 'le-jardin-marrakech', 'Médina', '32 Souk Sidi Abdelaziz, Marrakech 40000', ST_MakePoint(-7.9860, 31.6300)::geography, '+212524378295', '+212524378295', '@lejardinmarrakech', 'https://lejardin-marrakech.com', '€€€', 'Casual chic', 'Ambient / Lounge', 'All ages', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "garden": true, "concept_store": true}', 'published', false, 82, 'Hidden garden oasis in the medina'),

-- 5. Lotus Club
(4, 3, 'Lotus Club', 'lotus-club-marrakech', 'Hivernage', 'Av. Mohammed VI, Hivernage, Marrakech 40000', ST_MakePoint(-8.0120, 31.6200)::geography, '+212524431313', '+212524431313', '@lotusclubmarrakech', 'https://lotusclub.ma', '€€€€', 'Dress to impress', 'EDM / House / Techno', '21+', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "capacity": 600, "vip_tables": true}', 'published', true, 91, 'Premier nightclub, international DJs regularly'),

-- 6. So Night Lounge
(4, 3, 'So Night Lounge', 'so-night-lounge', 'Hivernage', 'Sofitel Marrakech, Rue Harroun Errachid, Marrakech 40000', ST_MakePoint(-8.0080, 31.6215)::geography, '+212524425600', '+212524425600', '@sonightlounge', 'https://sonightlounge.ma', '€€€€', 'Smart elegant', 'House / R&B', '21+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "hotel_venue": true}', 'published', false, 84, 'At the Sofitel — polished, reliable crowd'),

-- 7. Bagatelle Marrakech
(4, 4, 'Bagatelle Marrakech', 'bagatelle-marrakech', 'Palmeraie', 'Route de Fès, Palmeraie, Marrakech 40000', ST_MakePoint(-7.9600, 31.6700)::geography, '+212524334088', '+212524334088', '@bagatellemarrakech', 'https://bagatellemarrakech.com', '€€€€', 'Beach club chic', 'Tropical house / DJ sets', '18+', 'yes', '{"has_terrace": true, "has_pool": true, "reservation_required": true, "day_club": true, "capacity": 500}', 'published', true, 93, 'International brand, big-budget events, St. Tropez vibe'),

-- 8. Café Arabe
(4, 1, 'Café Arabe', 'cafe-arabe-marrakech', 'Médina', '184 Rue Mouassine, Marrakech 40030', ST_MakePoint(-7.9880, 31.6310)::geography, '+212524429728', '+212524429728', '@cafearabemarrakech', 'https://cafearabe.com', '€€€', 'Smart casual', 'Lounge / Gnawa', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "rooftop": true, "cooking_classes": true}', 'published', false, 81, 'Great rooftop for Koutoubia views, solid Italian-Moroccan fusion'),

-- 9. Le Salama
(4, 1, 'Le Salama', 'le-salama-marrakech', 'Médina', '40 Rue des Banques, Jemaa el-Fna, Marrakech 40000', ST_MakePoint(-7.9890, 31.6255)::geography, '+212524391200', '+212524391200', '@lesalamamarrakech', 'https://lesalama.com', '€€€', 'Smart casual', 'Oriental / Live music', 'All ages', 'yes', '{"has_terrace": true, "has_pool": false, "reservation_required": true, "rooftop": true, "jemaa_view": true}', 'published', false, 79, 'Overlooks Jemaa el-Fna — prime real estate'),

-- 10. 555 Famous Club
(4, 3, '555 Famous Club', '555-famous-club', 'Hivernage', 'Av. Mohammed VI, Hivernage, Marrakech 40000', ST_MakePoint(-8.0130, 31.6195)::geography, '+212524449555', '+212524449555', '@555famousclub', 'https://555famousclub.com', '€€€€', 'Dress to impress', 'Commercial / EDM / Hip hop', '21+', 'yes', '{"has_terrace": false, "has_pool": false, "reservation_required": true, "capacity": 800, "vip_tables": true, "bottle_service": true}', 'published', true, 89, 'Biggest club in Marrakech, massive international acts');


-- ============================================================
-- CONTENTS — Bilingual descriptions (FR + EN) for each venue
-- ============================================================

-- CASABLANCA venues (venue_id 1–10)
INSERT INTO contents (venue_id, language, description, seo_keywords) VALUES
-- Sky 28
(1, 'fr', 'Perché au 28e étage de la Kenzi Tower, Sky 28 offre une vue à couper le souffle sur tout Casablanca. Cocktails signatures, ambiance deep house feutrée et clientèle select font de cet espace le rendez-vous incontournable du nightlife casablancais.', ARRAY['sky 28 casablanca', 'rooftop casablanca', 'bar panoramique casablanca']),
(1, 'en', 'Perched on the 28th floor of the Kenzi Tower, Sky 28 delivers a breathtaking panorama of Casablanca''s skyline. Signature cocktails, refined deep house beats, and an exclusive crowd make it the city''s ultimate rooftop destination.', ARRAY['sky 28 casablanca', 'casablanca rooftop bar', 'best views casablanca']),

-- Le Cabestan
(2, 'fr', 'Institution casablancaise face à l''océan Atlantique, Le Cabestan conjugue gastronomie française et produits de la mer d''exception. La terrasse surplombant les vagues est simplement magique au coucher du soleil.', ARRAY['le cabestan casablanca', 'restaurant ocean casablanca', 'gastronomie casablanca']),
(2, 'en', 'A Casablanca institution perched above the Atlantic, Le Cabestan pairs refined French cuisine with extraordinary seafood. Its terrace overlooking the crashing waves is nothing short of magical at sunset.', ARRAY['le cabestan casablanca', 'ocean restaurant casablanca', 'fine dining casablanca']),

-- Rick's Cafe
(3, 'fr', 'Inspiré du film mythique, Rick''s Cafe recréé l''atmosphère romantique du Casablanca des années 40. Piano-bar live, décor art-déco soigné et une carte qui rend hommage aux saveurs marocaines et internationales.', ARRAY['ricks cafe casablanca', 'piano bar casablanca', 'restaurant medina casablanca']),
(3, 'en', 'Inspired by the legendary film, Rick''s Cafe recreates the romantic atmosphere of 1940s Casablanca. With its live piano bar, impeccable art-deco interiors, and a menu celebrating both Moroccan and international flavors, it''s a timeless classic.', ARRAY['ricks cafe casablanca', 'piano bar casablanca', 'movie themed restaurant morocco']),

-- La Sqala
(4, 'fr', 'Nichée dans un jardin-forteresse du XVIIIe siècle en plein coeur de l''ancienne médina, La Sqala est un havre de paix. Brunch légendaire, thé à la menthe parfait et tajines préparés avec amour dans un cadre historique unique.', ARRAY['la sqala casablanca', 'brunch casablanca', 'restaurant jardin casablanca medina']),
(4, 'en', 'Nestled within an 18th-century garden fortress in the heart of the old medina, La Sqala is a peaceful haven. Legendary brunch, perfect mint tea, and lovingly prepared tagines await in a uniquely historic setting.', ARRAY['la sqala casablanca', 'brunch casablanca', 'garden restaurant casablanca medina']),

-- Blanco
(5, 'fr', 'Sur la corniche d''Ain Diab, Blanco est le spot chic par excellence. Piscine, cocktails élaborés et DJ sets enflammés attirent la jeunesse dorée de Casablanca chaque week-end. L''ambiance monte crescendo jusqu''au bout de la nuit.', ARRAY['blanco casablanca', 'lounge corniche casablanca', 'piscine club casablanca']),
(5, 'en', 'On the Ain Diab corniche, Blanco is Casablanca''s ultimate chic hangout. A sparkling pool, expertly crafted cocktails, and fiery DJ sets draw the city''s golden youth every weekend, with the energy building until the early hours.', ARRAY['blanco casablanca', 'corniche lounge casablanca', 'pool party casablanca']),

-- Bazaar
(6, 'fr', 'Bazaar séduit par son décor éclectique mêlant influences orientales et design contemporain. La carte fusion ravit les palais aventuriers et l''ambiance world music transforme chaque dîner en voyage sensoriel.', ARRAY['bazaar casablanca', 'restaurant fusion casablanca', 'sortie gauthier casablanca']),
(6, 'en', 'Bazaar charms with its eclectic decor blending oriental influences and contemporary design. The fusion menu delights adventurous palates while the world music soundtrack turns every dinner into a sensory journey.', ARRAY['bazaar casablanca', 'fusion restaurant casablanca', 'trendy dining casablanca']),

-- L'Atelier de Joël Robuchon
(7, 'fr', 'L''excellence de la haute gastronomie française au coeur de Casablanca. L''Atelier de Joël Robuchon, installé au Four Seasons, propose une expérience culinaire d''exception avec son comptoir signature et ses plats d''une précision remarquable.', ARRAY['robuchon casablanca', 'gastronomie four seasons casablanca', 'restaurant etoile casablanca']),
(7, 'en', 'The pinnacle of French haute cuisine in Casablanca. Housed within the Four Seasons, L''Atelier de Joël Robuchon delivers an extraordinary culinary experience with its signature counter seating and dishes of remarkable precision.', ARRAY['robuchon casablanca', 'four seasons dining casablanca', 'best fine dining casablanca']),

-- Brasserie La Tour
(8, 'fr', 'Ambiance parisienne au coeur de Casablanca, Brasserie La Tour propose une carte française classique dans un cadre chaleureux. Idéal pour un déjeuner d''affaires ou un dîner en tête-à-tête accompagné d''un bon cru.', ARRAY['brasserie la tour casablanca', 'restaurant francais casablanca', 'dejeuner affaires casablanca']),
(8, 'en', 'A slice of Paris in the heart of Casablanca, Brasserie La Tour offers a classic French menu in a warm, inviting setting. Perfect for a business lunch or an intimate dinner paired with a fine vintage.', ARRAY['brasserie la tour casablanca', 'french restaurant casablanca', 'business lunch casablanca']),

-- Le Petit Rocher
(9, 'fr', 'Accroché aux rochers face à l''Atlantique, Le Petit Rocher est le temple du poisson frais à Casablanca. Fruits de mer étincelants, vue spectaculaire et brise marine composent une expérience inoubliable.', ARRAY['le petit rocher casablanca', 'fruits de mer casablanca', 'restaurant bord de mer casablanca']),
(9, 'en', 'Clinging to the rocks above the Atlantic, Le Petit Rocher is Casablanca''s temple of fresh fish. Glistening seafood, spectacular views, and a salty sea breeze combine for an unforgettable experience.', ARRAY['le petit rocher casablanca', 'seafood casablanca', 'oceanfront restaurant casablanca']),

-- Ain Diab Beach Club
(10, 'fr', 'Le Beach Club d''Ain Diab est l''adresse estivale incontournable. Piscine face à l''océan, transats confortables, DJ sets tropicaux et cocktails glacés créent une atmosphère de vacances permanente sur la côte casablancaise.', ARRAY['ain diab beach club', 'beach club casablanca', 'piscine plage casablanca']),
(10, 'en', 'Ain Diab Beach Club is the essential summer address. An oceanfront pool, comfortable sun loungers, tropical DJ sets, and icy cocktails create a perpetual holiday vibe on the Casablanca coast.', ARRAY['ain diab beach club', 'casablanca beach club', 'pool party ain diab']);

-- RABAT venues (venue_id 11–20)
INSERT INTO contents (venue_id, language, description, seo_keywords) VALUES
-- Dar Zaki
(11, 'fr', 'Riad traditionnel niché dans la médina de Rabat, Dar Zaki propose une cuisine marocaine authentique dans un cadre intimiste. Les soirées gnawa ajoutent une dimension mystique à une expérience culinaire déjà envoûtante.', ARRAY['dar zaki rabat', 'riad restaurant rabat', 'cuisine marocaine rabat medina']),
(11, 'en', 'A traditional riad hidden in Rabat''s medina, Dar Zaki serves authentic Moroccan cuisine in an intimate setting. Gnawa music evenings add a mystical dimension to an already enchanting dining experience.', ARRAY['dar zaki rabat', 'riad restaurant rabat', 'moroccan cuisine rabat medina']),

-- Le Dhow
(12, 'fr', 'Lounge flottant unique amarré sur le Bouregreg, Le Dhow offre une expérience hors du commun. Cocktails créatifs, tapas raffinées et vue imprenable sur la Kasbah des Oudayas illuminée font de chaque soirée un moment d''exception.', ARRAY['le dhow rabat', 'lounge flottant rabat', 'bar bouregreg rabat']),
(12, 'en', 'A unique floating lounge moored on the Bouregreg river, Le Dhow delivers an extraordinary experience. Creative cocktails, refined tapas, and a stunning view of the illuminated Kasbah des Oudayas make every evening exceptional.', ARRAY['le dhow rabat', 'floating bar rabat', 'bouregreg lounge rabat']),

-- Villa Mandarine
(13, 'fr', 'Écrin de verdure dans le quartier résidentiel de Souissi, Villa Mandarine propose une cuisine gastronomique dans un jardin d''orangers centenaires. L''atmosphère est celle d''un déjeuner privé dans la plus belle propriété de Rabat.', ARRAY['villa mandarine rabat', 'restaurant gastronomique rabat', 'jardin souissi rabat']),
(13, 'en', 'A lush green sanctuary in the residential Souissi district, Villa Mandarine offers gourmet cuisine amid century-old orange groves. The atmosphere evokes a private luncheon at Rabat''s most beautiful estate.', ARRAY['villa mandarine rabat', 'fine dining rabat', 'garden restaurant souissi']),

-- Cosmopolitan
(14, 'fr', 'Ambiance jeune et branchée dans le quartier d''Agdal, Cosmopolitan est le spot des nuits rabaties. DJ sets R&B, cocktails généreux et terrasse animée attirent une foule cosmopolite en quête de bonne énergie.', ARRAY['cosmopolitan rabat', 'bar agdal rabat', 'sortie nuit rabat']),
(14, 'en', 'Young and trendy in the Agdal district, Cosmopolitan is Rabat''s go-to nightlife spot. R&B DJ sets, generous cocktails, and a buzzing terrace draw a cosmopolitan crowd looking for good energy.', ARRAY['cosmopolitan rabat', 'agdal bar rabat', 'nightlife rabat']),

-- Paul Rabat
(15, 'fr', 'L''enseigne française Paul a trouvé un bel écrin à Agdal. Viennoiseries dorées, salades fraîches et pâtisseries délicates dans un cadre lumineux. Le brunch du week-end est devenu un rituel pour les familles rabatoises.', ARRAY['paul rabat', 'brunch rabat agdal', 'boulangerie francaise rabat']),
(15, 'en', 'The French bakery chain Paul has found a lovely home in Agdal. Golden pastries, fresh salads, and delicate desserts in a bright setting. The weekend brunch has become a ritual for Rabat''s families.', ARRAY['paul rabat', 'brunch rabat agdal', 'french bakery rabat']),

-- Le Pietri
(16, 'fr', 'Derrière sa façade art-déco, Le Pietri cache un intérieur élégant où se mêlent jazz doux et saveurs méditerranéennes. La carte des vins est l''une des plus complètes de la capitale, et le service impeccable.', ARRAY['le pietri rabat', 'restaurant art deco rabat', 'carte des vins rabat']),
(16, 'en', 'Behind its art-deco facade, Le Pietri reveals an elegant interior where gentle jazz meets Mediterranean flavors. Its wine list is one of the most comprehensive in the capital, and the service is impeccable.', ARRAY['le pietri rabat', 'art deco restaurant rabat', 'wine list rabat']),

-- Café Maure
(17, 'fr', 'Perché sur les remparts de la Kasbah des Oudayas, le Café Maure est une institution centenaire. Thé à la menthe servi sur des nattes face au bleu infini de l''Atlantique — un moment de grâce suspendu dans le temps.', ARRAY['cafe maure rabat', 'oudayas cafe rabat', 'the a la menthe rabat kasbah']),
(17, 'en', 'Perched on the ramparts of the Kasbah des Oudayas, Café Maure is a centuries-old institution. Mint tea served on woven mats facing the endless blue Atlantic — a moment of grace suspended in time.', ARRAY['cafe maure rabat', 'oudayas tea rabat', 'kasbah cafe rabat']),

-- La Tour Hassan
(18, 'fr', 'Dining d''exception dans l''enceinte du mythique palace La Tour Hassan. Cuisine française et marocaine sublimée par un service irréprochable et un cadre somptueux digne des réceptions d''État.', ARRAY['la tour hassan restaurant rabat', 'palace rabat dining', 'gastronomie rabat']),
(18, 'en', 'Exceptional dining within the legendary La Tour Hassan palace. French and Moroccan cuisine elevated by impeccable service and sumptuous surroundings worthy of a state reception.', ARRAY['la tour hassan restaurant rabat', 'palace dining rabat', 'fine dining rabat']),

-- Balima
(19, 'fr', 'Le Balima, institution historique sur l''avenue Mohammed V, est en pleine renaissance. Sa terrasse mythique offre une vue imprenable sur le Parlement et le cœur battant de la capitale.', ARRAY['balima rabat', 'hotel balima rabat', 'terrasse mohammed v rabat']),
(19, 'en', 'The Balima, a historic institution on Avenue Mohammed V, is undergoing a glorious renaissance. Its legendary terrace offers an unbeatable view of Parliament and the beating heart of the capital.', ARRAY['balima rabat', 'balima hotel rabat', 'mohammed v terrace rabat']),

-- Jazz Bar Rabat
(20, 'fr', 'Cave intimiste dédiée au jazz et au blues, le Jazz Bar Rabat accueille des formations live du jeudi au samedi. Whisky single malt, lumières tamisées et notes de saxophone créent une bulle hors du temps.', ARRAY['jazz bar rabat', 'musique live rabat', 'bar jazz rabat']),
(20, 'en', 'An intimate basement venue dedicated to jazz and blues, Jazz Bar Rabat hosts live bands from Thursday to Saturday. Single malt whisky, dim lighting, and saxophone notes create a timeless bubble.', ARRAY['jazz bar rabat', 'live music rabat', 'jazz club rabat']);

-- TANGIER venues (venue_id 21–30)
INSERT INTO contents (venue_id, language, description, seo_keywords) VALUES
-- El Morocco Club
(21, 'fr', 'Joyau de la Kasbah de Tanger, El Morocco Club allie galerie d''art, cocktails d''auteur et vue panoramique sur le détroit de Gibraltar. Chaque recoin de ce palais restauré raconte une histoire, et chaque soirée y est inoubliable.', ARRAY['el morocco club tanger', 'bar kasbah tanger', 'cocktails vue mer tanger']),
(21, 'en', 'The jewel of Tangier''s Kasbah, El Morocco Club combines an art gallery, artisan cocktails, and a panoramic view of the Strait of Gibraltar. Every corner of this restored palace tells a story, and every evening here is unforgettable.', ARRAY['el morocco club tangier', 'kasbah bar tangier', 'sea view cocktails tangier']),

-- Nord-Pinus Tanger
(22, 'fr', 'Hôtel-boutique mythique, Nord-Pinus Tanger respire l''élégance bohème. Sa piscine cachée sur le toit et son bar intime attirent photographes de mode et globe-trotters avertis en quête d''authenticité.', ARRAY['nord pinus tanger', 'hotel boutique tanger', 'rooftop piscine tanger']),
(22, 'en', 'A legendary boutique hotel, Nord-Pinus Tanger exudes bohemian elegance. Its hidden rooftop pool and intimate bar attract fashion photographers and discerning globetrotters seeking authenticity.', ARRAY['nord pinus tangier', 'boutique hotel tangier', 'rooftop pool tangier']),

-- La Fabrique
(23, 'fr', 'Ancien entrepôt industriel reconverti, La Fabrique est le temple de la musique électronique à Tanger. Sound system puissant, line-ups pointus et énergie collective font vibrer la ville nouvelle chaque week-end.', ARRAY['la fabrique tanger', 'club techno tanger', 'nightclub tanger']),
(23, 'en', 'A converted industrial warehouse, La Fabrique is Tangier''s temple of electronic music. A powerful sound system, curated lineups, and collective energy make the Ville Nouvelle pulse every weekend.', ARRAY['la fabrique tangier', 'techno club tangier', 'nightclub tangier']),

-- Café Hafa
(24, 'fr', 'Depuis 1921, Café Hafa déroule ses terrasses en escalier face au détroit de Gibraltar. Ici, le temps s''arrête : thé à la menthe, brise marine et silence contemplatif dans un lieu chargé d''histoire et de légendes.', ARRAY['cafe hafa tanger', 'terrasse vue mer tanger', 'cafe historique tanger']),
(24, 'en', 'Since 1921, Café Hafa has cascaded its terraces down the cliff facing the Strait of Gibraltar. Time stops here: mint tea, sea breeze, and contemplative silence in a place steeped in history and legend.', ARRAY['cafe hafa tangier', 'sea view terrace tangier', 'historic cafe tangier']),

-- Salon Bleu
(25, 'fr', 'Petit bijou bleu perché dans la médina, Salon Bleu offre une terrasse avec vue imprenable sur le port et la mer. Jus frais, pâtisseries maison et une atmosphère apaisante en font l''adresse secrète préférée des initiés.', ARRAY['salon bleu tanger', 'terrasse medina tanger', 'cafe vue port tanger']),
(25, 'en', 'A little blue gem perched in the medina, Salon Bleu offers a terrace with a stunning view of the port and the sea. Fresh juices, homemade pastries, and a soothing atmosphere make it the insiders'' favorite secret spot.', ARRAY['salon bleu tangier', 'medina terrace tangier', 'port view cafe tangier']),

-- Tangerinn
(26, 'fr', 'Installé dans l''hôtel El Muniria où William Burroughs écrivit Le Festin Nu, Tangerinn perpétue l''esprit beat de Tanger. Concerts acoustiques, bières artisanales et une ambiance littéraire unique au monde.', ARRAY['tangerinn tanger', 'bar beat generation tanger', 'musique live tanger']),
(26, 'en', 'Set in the El Muniria hotel where William Burroughs penned Naked Lunch, Tangerinn keeps the beat spirit of Tangier alive. Acoustic concerts, craft beers, and a literary ambiance that''s one of a kind.', ARRAY['tangerinn tangier', 'beat generation bar tangier', 'live music tangier']),

-- Le Saveur de Poisson
(27, 'fr', 'Pas de carte, pas de choix, juste le poisson le plus frais de Tanger préparé sous vos yeux. Le Saveur de Poisson est une expérience brute et authentique qui a conquis gourmets et critiques du monde entier.', ARRAY['le saveur de poisson tanger', 'restaurant poisson tanger', 'meilleur poisson tanger']),
(27, 'en', 'No menu, no choices, just the freshest fish in Tangier prepared before your eyes. Le Saveur de Poisson is a raw, authentic experience that has won over foodies and critics from around the world.', ARRAY['le saveur de poisson tangier', 'fish restaurant tangier', 'best seafood tangier']),

-- Dar Nour
(28, 'fr', 'Maison d''hôtes de charme dans la Kasbah, Dar Nour séduit par sa terrasse surplombant le détroit et son ambiance cosy. L''heure dorée y est spectaculaire, un verre de vin marocain à la main.', ARRAY['dar nour tanger', 'riad kasbah tanger', 'terrasse coucher soleil tanger']),
(28, 'en', 'A charming guesthouse in the Kasbah, Dar Nour captivates with its terrace overlooking the strait and its cozy ambiance. The golden hour here is spectacular, best enjoyed with a glass of Moroccan wine in hand.', ARRAY['dar nour tangier', 'kasbah riad tangier', 'sunset terrace tangier']),

-- Anna & Paolo
(29, 'fr', 'La meilleure table italienne de Tanger, Anna & Paolo propose des pâtes fraîches, des antipasti généreux et une carte des vins transalpine soignée. L''accueil chaleureux et la terrasse verdoyante complètent le tableau.', ARRAY['anna paolo tanger', 'restaurant italien tanger', 'pasta tanger']),
(29, 'en', 'The best Italian table in Tangier, Anna & Paolo offers fresh pasta, generous antipasti, and a carefully curated Italian wine list. A warm welcome and a leafy terrace complete the picture.', ARRAY['anna paolo tangier', 'italian restaurant tangier', 'pasta tangier']),

-- Le Nabab
(30, 'fr', 'Cuisine marocaine raffinée dans un cadre oriental opulent, Le Nabab propose des classiques revisités avec élégance. Les tajines sont sublimés et le service attentionné en fait une valeur sûre de la Ville Nouvelle.', ARRAY['le nabab tanger', 'restaurant marocain tanger', 'tajine tanger']),
(30, 'en', 'Refined Moroccan cuisine in an opulent oriental setting, Le Nabab offers elegantly reimagined classics. The tagines are superb and the attentive service makes it a reliable choice in the Ville Nouvelle.', ARRAY['le nabab tangier', 'moroccan restaurant tangier', 'tagine tangier']);

-- MARRAKECH venues (venue_id 31–40)
INSERT INTO contents (venue_id, language, description, seo_keywords) VALUES
-- Comptoir Darna
(31, 'fr', 'Le Comptoir Darna est une véritable institution marrakchie. Dîner-spectacle avec danseuses orientales, cuisine marocaine revisitée et ambiance électrique font de chaque soirée une célébration. Incontournable à Hivernage.', ARRAY['comptoir darna marrakech', 'diner spectacle marrakech', 'restaurant hivernage marrakech']),
(31, 'en', 'Comptoir Darna is a true Marrakech institution. Dinner shows with belly dancers, reimagined Moroccan cuisine, and an electric atmosphere make every evening a celebration. A Hivernage must-visit.', ARRAY['comptoir darna marrakech', 'dinner show marrakech', 'hivernage restaurant marrakech']),

-- La Mamounia Bar
(32, 'fr', 'Le bar de La Mamounia incarne le luxe absolu. Sous les plafonds peints à la main, dégustez des cocktails d''exception dans les pas de Churchill et de générations de célébrités. Les jardins illuminés offrent un cadre féerique.', ARRAY['la mamounia bar marrakech', 'bar palace marrakech', 'cocktails luxe marrakech']),
(32, 'en', 'La Mamounia Bar embodies absolute luxury. Beneath hand-painted ceilings, savor exceptional cocktails in the footsteps of Churchill and generations of celebrities. The illuminated gardens provide a fairy-tale backdrop.', ARRAY['la mamounia bar marrakech', 'palace bar marrakech', 'luxury cocktails marrakech']),

-- Kabana
(33, 'fr', 'Rooftop branché au coeur de la médina, Kabana propose piscine, DJ sets afro-house et tapas créatives. L''ambiance solaire en journée se mue en soirée festive dès que le soleil se couche sur les toits de Marrakech.', ARRAY['kabana marrakech', 'rooftop piscine marrakech', 'pool bar medina marrakech']),
(33, 'en', 'A trendy rooftop in the heart of the medina, Kabana offers a pool, Afro-house DJ sets, and creative tapas. The sunny daytime vibe transforms into a festive evening as the sun sets over the rooftops of Marrakech.', ARRAY['kabana marrakech', 'rooftop pool marrakech', 'pool bar medina marrakech']),

-- Le Jardin
(34, 'fr', 'Oasis de verdure caché dans les souks, Le Jardin est un refuge de sérénité. Cuisine healthy, concept store et jardin luxuriant créent une parenthèse enchantée loin de l''effervescence de la médina.', ARRAY['le jardin marrakech', 'restaurant souks marrakech', 'jardin secret medina marrakech']),
(34, 'en', 'A green oasis hidden in the souks, Le Jardin is a refuge of serenity. Healthy cuisine, a concept store, and lush gardens create an enchanted escape from the medina''s whirlwind energy.', ARRAY['le jardin marrakech', 'souks restaurant marrakech', 'hidden garden medina marrakech']),

-- Lotus Club
(35, 'fr', 'Le Lotus Club est la référence nightlife de Marrakech. DJs internationaux, son irréprochable et un public de fêtards acharnés convergent chaque week-end dans ce club mythique du quartier Hivernage.', ARRAY['lotus club marrakech', 'nightclub marrakech', 'club hivernage marrakech']),
(35, 'en', 'Lotus Club is Marrakech''s nightlife benchmark. International DJs, flawless sound, and a crowd of dedicated revelers converge every weekend at this legendary club in the Hivernage district.', ARRAY['lotus club marrakech', 'nightclub marrakech', 'hivernage club marrakech']),

-- So Night Lounge
(36, 'fr', 'Au sein du Sofitel, So Night Lounge offre une expérience nocturne haut de gamme. Piscine illuminée, cocktails moléculaires et programmation musicale pointue dans un écrin de design contemporain.', ARRAY['so night lounge marrakech', 'sofitel club marrakech', 'lounge hivernage marrakech']),
(36, 'en', 'Within the Sofitel hotel, So Night Lounge delivers a premium nightlife experience. An illuminated pool, molecular cocktails, and curated music programming in a contemporary design setting.', ARRAY['so night lounge marrakech', 'sofitel club marrakech', 'hivernage lounge marrakech']),

-- Bagatelle Marrakech
(37, 'fr', 'L''esprit Saint-Tropez souffle sur la Palmeraie. Bagatelle Marrakech déploie piscine XXL, brunchs festifs et DJ sets tropicaux dans un cadre à la fois chic et décontracté. L''adresse pool party de référence.', ARRAY['bagatelle marrakech', 'pool party marrakech', 'beach club palmeraie marrakech']),
(37, 'en', 'The spirit of Saint-Tropez blows through the Palmeraie. Bagatelle Marrakech features an oversized pool, festive brunches, and tropical DJ sets in a setting that is both chic and laid-back. The definitive pool party address.', ARRAY['bagatelle marrakech', 'pool party marrakech', 'beach club palmeraie marrakech']),

-- Café Arabe
(38, 'fr', 'En plein quartier Mouassine, Café Arabe marie cuisine italienne et marocaine sur un rooftop offrant une vue magique sur la Koutoubia. Cours de cuisine, expositions et soirées gnawa ajoutent du caractère à cette adresse culte.', ARRAY['cafe arabe marrakech', 'rooftop koutoubia marrakech', 'restaurant mouassine marrakech']),
(38, 'en', 'In the heart of the Mouassine quarter, Café Arabe blends Italian and Moroccan cuisine on a rooftop with a magical view of the Koutoubia. Cooking classes, exhibitions, and Gnawa evenings add character to this cult address.', ARRAY['cafe arabe marrakech', 'koutoubia rooftop marrakech', 'mouassine restaurant marrakech']),

-- Le Salama
(39, 'fr', 'Surplombant la place Jemaa el-Fna, Le Salama offre un spectacle vivant depuis sa terrasse panoramique. Cuisine marocaine généreuse, musique orientale live et une vue imprenable sur le théâtre de rue le plus fascinant du monde.', ARRAY['le salama marrakech', 'restaurant jemaa el fna', 'terrasse place marrakech']),
(39, 'en', 'Overlooking Jemaa el-Fna square, Le Salama offers a living spectacle from its panoramic terrace. Generous Moroccan cuisine, live oriental music, and an unbeatable view of the world''s most fascinating street theater.', ARRAY['le salama marrakech', 'jemaa el fna restaurant', 'square view dining marrakech']),

-- 555 Famous Club
(40, 'fr', 'Le plus grand club de Marrakech, le 555 Famous Club attire les fêtards du monde entier. Line-ups internationaux, service VIP en bouteilles et une énergie débordante font de chaque nuit un événement à part entière.', ARRAY['555 famous club marrakech', 'plus grand club marrakech', 'nightlife marrakech hivernage']),
(40, 'en', 'The biggest club in Marrakech, 555 Famous Club draws partygoers from around the globe. International lineups, VIP bottle service, and overflowing energy make every night an event in its own right.', ARRAY['555 famous club marrakech', 'biggest club marrakech', 'marrakech nightlife hivernage']);


-- ============================================================
-- PHOTOS
-- ============================================================

-- Casablanca venues (1–10)
INSERT INTO photos (venue_id, url, alt, is_cover, "order") VALUES
(1, '/images/venues/sky-28-1.jpg', 'Sky 28 rooftop panoramic view at night', true, 1),
(1, '/images/venues/sky-28-2.jpg', 'Sky 28 cocktail bar counter', false, 2),
(1, '/images/venues/sky-28-3.jpg', 'Sky 28 lounge seating area', false, 3),
(2, '/images/venues/le-cabestan-1.jpg', 'Le Cabestan terrace overlooking Atlantic waves', true, 1),
(2, '/images/venues/le-cabestan-2.jpg', 'Le Cabestan seafood platter', false, 2),
(2, '/images/venues/le-cabestan-3.jpg', 'Le Cabestan interior dining room', false, 3),
(3, '/images/venues/ricks-cafe-1.jpg', 'Rick''s Cafe art-deco interior with piano', true, 1),
(3, '/images/venues/ricks-cafe-2.jpg', 'Rick''s Cafe courtyard dining', false, 2),
(4, '/images/venues/la-sqala-1.jpg', 'La Sqala garden courtyard with orange trees', true, 1),
(4, '/images/venues/la-sqala-2.jpg', 'La Sqala traditional brunch spread', false, 2),
(5, '/images/venues/blanco-casa-1.jpg', 'Blanco poolside lounge at sunset', true, 1),
(5, '/images/venues/blanco-casa-2.jpg', 'Blanco DJ booth and dance area', false, 2),
(5, '/images/venues/blanco-casa-3.jpg', 'Blanco cocktail selection', false, 3),
(6, '/images/venues/bazaar-casa-1.jpg', 'Bazaar eclectic interior decor', true, 1),
(6, '/images/venues/bazaar-casa-2.jpg', 'Bazaar fusion cuisine plate', false, 2),
(7, '/images/venues/latelier-joel-robuchon-casa-1.jpg', 'L''Atelier de Joel Robuchon counter seating', true, 1),
(7, '/images/venues/latelier-joel-robuchon-casa-2.jpg', 'Robuchon signature tasting menu dish', false, 2),
(7, '/images/venues/latelier-joel-robuchon-casa-3.jpg', 'Robuchon Casablanca wine cellar', false, 3),
(8, '/images/venues/brasserie-la-tour-1.jpg', 'Brasserie La Tour classic French interior', true, 1),
(8, '/images/venues/brasserie-la-tour-2.jpg', 'Brasserie La Tour terrace seating', false, 2),
(9, '/images/venues/le-petit-rocher-1.jpg', 'Le Petit Rocher seaside terrace with ocean view', true, 1),
(9, '/images/venues/le-petit-rocher-2.jpg', 'Le Petit Rocher fresh seafood display', false, 2),
(10, '/images/venues/ain-diab-beach-club-1.jpg', 'Ain Diab Beach Club pool and ocean panorama', true, 1),
(10, '/images/venues/ain-diab-beach-club-2.jpg', 'Ain Diab Beach Club DJ set at sunset', false, 2),
(10, '/images/venues/ain-diab-beach-club-3.jpg', 'Ain Diab Beach Club cabanas and loungers', false, 3);

-- Rabat venues (11–20)
INSERT INTO photos (venue_id, url, alt, is_cover, "order") VALUES
(11, '/images/venues/dar-zaki-1.jpg', 'Dar Zaki riad courtyard with fountain', true, 1),
(11, '/images/venues/dar-zaki-2.jpg', 'Dar Zaki traditional Moroccan dinner table', false, 2),
(12, '/images/venues/le-dhow-1.jpg', 'Le Dhow floating lounge illuminated at night', true, 1),
(12, '/images/venues/le-dhow-2.jpg', 'Le Dhow cocktails with Kasbah backdrop', false, 2),
(12, '/images/venues/le-dhow-3.jpg', 'Le Dhow deck seating at golden hour', false, 3),
(13, '/images/venues/villa-mandarine-1.jpg', 'Villa Mandarine garden dining under orange trees', true, 1),
(13, '/images/venues/villa-mandarine-2.jpg', 'Villa Mandarine pool and terrace', false, 2),
(13, '/images/venues/villa-mandarine-3.jpg', 'Villa Mandarine gourmet plating', false, 3),
(14, '/images/venues/cosmopolitan-rabat-1.jpg', 'Cosmopolitan bar counter and neon lights', true, 1),
(14, '/images/venues/cosmopolitan-rabat-2.jpg', 'Cosmopolitan terrace crowd on weekend', false, 2),
(15, '/images/venues/paul-rabat-1.jpg', 'Paul Rabat bakery display and pastries', true, 1),
(15, '/images/venues/paul-rabat-2.jpg', 'Paul Rabat sunny terrace brunch', false, 2),
(16, '/images/venues/le-pietri-1.jpg', 'Le Pietri art-deco dining room', true, 1),
(16, '/images/venues/le-pietri-2.jpg', 'Le Pietri wine selection', false, 2),
(17, '/images/venues/cafe-maure-rabat-1.jpg', 'Café Maure terrace overlooking the Atlantic', true, 1),
(17, '/images/venues/cafe-maure-rabat-2.jpg', 'Café Maure mint tea service on woven mats', false, 2),
(18, '/images/venues/la-tour-hassan-palace-1.jpg', 'La Tour Hassan palace dining hall', true, 1),
(18, '/images/venues/la-tour-hassan-palace-2.jpg', 'La Tour Hassan garden and pool area', false, 2),
(18, '/images/venues/la-tour-hassan-palace-3.jpg', 'La Tour Hassan gourmet dish presentation', false, 3),
(19, '/images/venues/balima-rabat-1.jpg', 'Balima hotel facade on Avenue Mohammed V', true, 1),
(19, '/images/venues/balima-rabat-2.jpg', 'Balima terrace overlooking Parliament', false, 2),
(20, '/images/venues/jazz-bar-rabat-1.jpg', 'Jazz Bar Rabat live saxophone performance', true, 1),
(20, '/images/venues/jazz-bar-rabat-2.jpg', 'Jazz Bar Rabat dim-lit whisky bar', false, 2);

-- Tangier venues (21–30)
INSERT INTO photos (venue_id, url, alt, is_cover, "order") VALUES
(21, '/images/venues/el-morocco-club-1.jpg', 'El Morocco Club panoramic terrace with strait view', true, 1),
(21, '/images/venues/el-morocco-club-2.jpg', 'El Morocco Club art gallery interior', false, 2),
(21, '/images/venues/el-morocco-club-3.jpg', 'El Morocco Club signature cocktail', false, 3),
(22, '/images/venues/nord-pinus-tanger-1.jpg', 'Nord-Pinus Tanger rooftop pool', true, 1),
(22, '/images/venues/nord-pinus-tanger-2.jpg', 'Nord-Pinus Tanger lounge interior', false, 2),
(23, '/images/venues/la-fabrique-tanger-1.jpg', 'La Fabrique industrial dance floor', true, 1),
(23, '/images/venues/la-fabrique-tanger-2.jpg', 'La Fabrique DJ booth and light show', false, 2),
(23, '/images/venues/la-fabrique-tanger-3.jpg', 'La Fabrique crowd on weekend night', false, 3),
(24, '/images/venues/cafe-hafa-1.jpg', 'Café Hafa cascading terraces over the strait', true, 1),
(24, '/images/venues/cafe-hafa-2.jpg', 'Café Hafa mint tea with sea view', false, 2),
(25, '/images/venues/salon-bleu-tanger-1.jpg', 'Salon Bleu blue terrace with port view', true, 1),
(25, '/images/venues/salon-bleu-tanger-2.jpg', 'Salon Bleu homemade pastries', false, 2),
(26, '/images/venues/tangerinn-1.jpg', 'Tangerinn bar with Beat Generation memorabilia', true, 1),
(26, '/images/venues/tangerinn-2.jpg', 'Tangerinn acoustic concert evening', false, 2),
(27, '/images/venues/le-saveur-de-poisson-1.jpg', 'Le Saveur de Poisson chef preparing fish', true, 1),
(27, '/images/venues/le-saveur-de-poisson-2.jpg', 'Le Saveur de Poisson fresh catch platter', false, 2),
(28, '/images/venues/dar-nour-tanger-1.jpg', 'Dar Nour terrace sunset over the strait', true, 1),
(28, '/images/venues/dar-nour-tanger-2.jpg', 'Dar Nour cozy riad interior', false, 2),
(29, '/images/venues/anna-paolo-tanger-1.jpg', 'Anna & Paolo leafy terrace dining', true, 1),
(29, '/images/venues/anna-paolo-tanger-2.jpg', 'Anna & Paolo fresh pasta dish', false, 2),
(30, '/images/venues/le-nabab-tanger-1.jpg', 'Le Nabab opulent oriental dining room', true, 1),
(30, '/images/venues/le-nabab-tanger-2.jpg', 'Le Nabab traditional tagine presentation', false, 2);

-- Marrakech venues (31–40)
INSERT INTO photos (venue_id, url, alt, is_cover, "order") VALUES
(31, '/images/venues/comptoir-darna-1.jpg', 'Comptoir Darna belly dance dinner show', true, 1),
(31, '/images/venues/comptoir-darna-2.jpg', 'Comptoir Darna vibrant dining room', false, 2),
(31, '/images/venues/comptoir-darna-3.jpg', 'Comptoir Darna Moroccan feast platter', false, 3),
(32, '/images/venues/la-mamounia-bar-1.jpg', 'La Mamounia Bar hand-painted ceiling interior', true, 1),
(32, '/images/venues/la-mamounia-bar-2.jpg', 'La Mamounia illuminated gardens at night', false, 2),
(32, '/images/venues/la-mamounia-bar-3.jpg', 'La Mamounia signature cocktail', false, 3),
(33, '/images/venues/kabana-marrakech-1.jpg', 'Kabana rooftop pool with medina views', true, 1),
(33, '/images/venues/kabana-marrakech-2.jpg', 'Kabana DJ set at sunset', false, 2),
(33, '/images/venues/kabana-marrakech-3.jpg', 'Kabana creative tapas selection', false, 3),
(34, '/images/venues/le-jardin-marrakech-1.jpg', 'Le Jardin lush garden courtyard', true, 1),
(34, '/images/venues/le-jardin-marrakech-2.jpg', 'Le Jardin healthy bowl and fresh juice', false, 2),
(35, '/images/venues/lotus-club-marrakech-1.jpg', 'Lotus Club main dance floor with laser show', true, 1),
(35, '/images/venues/lotus-club-marrakech-2.jpg', 'Lotus Club VIP area', false, 2),
(35, '/images/venues/lotus-club-marrakech-3.jpg', 'Lotus Club international DJ performing', false, 3),
(36, '/images/venues/so-night-lounge-1.jpg', 'So Night Lounge illuminated pool', true, 1),
(36, '/images/venues/so-night-lounge-2.jpg', 'So Night Lounge contemporary bar design', false, 2),
(37, '/images/venues/bagatelle-marrakech-1.jpg', 'Bagatelle Marrakech oversized pool party', true, 1),
(37, '/images/venues/bagatelle-marrakech-2.jpg', 'Bagatelle DJ set in Palmeraie', false, 2),
(37, '/images/venues/bagatelle-marrakech-3.jpg', 'Bagatelle brunch spread by the pool', false, 3),
(38, '/images/venues/cafe-arabe-marrakech-1.jpg', 'Café Arabe rooftop with Koutoubia view', true, 1),
(38, '/images/venues/cafe-arabe-marrakech-2.jpg', 'Café Arabe Italian-Moroccan fusion plate', false, 2),
(39, '/images/venues/le-salama-marrakech-1.jpg', 'Le Salama terrace overlooking Jemaa el-Fna', true, 1),
(39, '/images/venues/le-salama-marrakech-2.jpg', 'Le Salama live oriental music evening', false, 2),
(39, '/images/venues/le-salama-marrakech-3.jpg', 'Le Salama Moroccan dinner setting', false, 3),
(40, '/images/venues/555-famous-club-1.jpg', '555 Famous Club main room packed dance floor', true, 1),
(40, '/images/venues/555-famous-club-2.jpg', '555 Famous Club VIP bottle service', false, 2),
(40, '/images/venues/555-famous-club-3.jpg', '555 Famous Club DJ booth and LED wall', false, 3);


-- ============================================================
-- VENUES_TAGS
-- ============================================================

-- Tag ID reference:
-- 1=live-dj, 2=shisha, 3=sea-view, 4=rooftop, 5=terrace, 6=pool,
-- 7=valet-parking, 8=reservation-required, 9=halal, 10=wine-bar,
-- 11=cocktails, 12=live-music, 13=karaoke, 14=dance-floor, 15=vip-area,
-- 16=garden, 17=waterfront, 18=brunch, 19=late-night, 20=date-night,
-- 21=group-friendly, 22=business-dining, 23=family-friendly, 24=pet-friendly,
-- 25=outdoor-seating, 26=private-rooms, 27=sports-screening, 28=happy-hour,
-- 29=dress-code-strict, 30=women-friendly

-- CASABLANCA (venues 1–10)
INSERT INTO venues_tags (venue_id, tag_id) VALUES
-- Sky 28: rooftop, cocktails, vip-area, date-night, dress-code-strict
(1, 4), (1, 11), (1, 15), (1, 20), (1, 29),
-- Le Cabestan: sea-view, terrace, reservation-required, wine-bar, date-night
(2, 3), (2, 5), (2, 8), (2, 10), (2, 20),
-- Rick's Cafe: live-music, cocktails, reservation-required, date-night
(3, 12), (3, 11), (3, 8), (3, 20),
-- La Sqala: garden, terrace, brunch, family-friendly, halal
(4, 16), (4, 5), (4, 18), (4, 23), (4, 9),
-- Blanco: pool, live-dj, cocktails, late-night, vip-area
(5, 6), (5, 1), (5, 11), (5, 19), (5, 15),
-- Bazaar: terrace, cocktails, group-friendly, live-music
(6, 5), (6, 11), (6, 21), (6, 12),
-- L'Atelier de Joel Robuchon: reservation-required, wine-bar, business-dining, valet-parking, private-rooms
(7, 8), (7, 10), (7, 22), (7, 7), (7, 26),
-- Brasserie La Tour: terrace, wine-bar, business-dining, brunch
(8, 5), (8, 10), (8, 22), (8, 18),
-- Le Petit Rocher: sea-view, terrace, reservation-required, waterfront
(9, 3), (9, 5), (9, 8), (9, 17),
-- Ain Diab Beach Club: pool, live-dj, terrace, late-night, group-friendly
(10, 6), (10, 1), (10, 5), (10, 19), (10, 21);

-- RABAT (venues 11–20)
INSERT INTO venues_tags (venue_id, tag_id) VALUES
-- Dar Zaki: reservation-required, live-music, halal, date-night
(11, 8), (11, 12), (11, 9), (11, 20),
-- Le Dhow: waterfront, cocktails, terrace, date-night, vip-area
(12, 17), (12, 11), (12, 5), (12, 20), (12, 15),
-- Villa Mandarine: garden, pool, reservation-required, business-dining, private-rooms
(13, 16), (13, 6), (13, 8), (13, 22), (13, 26),
-- Cosmopolitan: live-dj, cocktails, terrace, late-night, dance-floor
(14, 1), (14, 11), (14, 5), (14, 19), (14, 14),
-- Paul Rabat: brunch, family-friendly, terrace, outdoor-seating
(15, 18), (15, 23), (15, 5), (15, 25),
-- Le Pietri: wine-bar, terrace, date-night, business-dining
(16, 10), (16, 5), (16, 20), (16, 22),
-- Café Maure: sea-view, terrace, outdoor-seating, family-friendly, halal
(17, 3), (17, 5), (17, 25), (17, 23), (17, 9),
-- La Tour Hassan: reservation-required, valet-parking, private-rooms, wine-bar, business-dining
(18, 8), (18, 7), (18, 26), (18, 10), (18, 22),
-- Balima: terrace, outdoor-seating, happy-hour
(19, 5), (19, 25), (19, 28),
-- Jazz Bar Rabat: live-music, cocktails, date-night, late-night
(20, 12), (20, 11), (20, 20), (20, 19);

-- TANGIER (venues 21–30)
INSERT INTO venues_tags (venue_id, tag_id) VALUES
-- El Morocco Club: sea-view, cocktails, rooftop, date-night, vip-area
(21, 3), (21, 11), (21, 4), (21, 20), (21, 15),
-- Nord-Pinus Tanger: pool, rooftop, terrace, reservation-required, dress-code-strict
(22, 6), (22, 4), (22, 5), (22, 8), (22, 29),
-- La Fabrique: live-dj, dance-floor, late-night, vip-area
(23, 1), (23, 14), (23, 19), (23, 15),
-- Café Hafa: sea-view, terrace, outdoor-seating, family-friendly, halal
(24, 3), (24, 5), (24, 25), (24, 23), (24, 9),
-- Salon Bleu: sea-view, terrace, outdoor-seating, family-friendly
(25, 3), (25, 5), (25, 25), (25, 23),
-- Tangerinn: live-music, terrace, cocktails
(26, 12), (26, 5), (26, 11),
-- Le Saveur de Poisson: reservation-required, halal, group-friendly
(27, 8), (27, 9), (27, 21),
-- Dar Nour: sea-view, terrace, date-night, wine-bar
(28, 3), (28, 5), (28, 20), (28, 10),
-- Anna & Paolo: terrace, wine-bar, reservation-required, date-night
(29, 5), (29, 10), (29, 8), (29, 20),
-- Le Nabab: terrace, reservation-required, shisha, group-friendly
(30, 5), (30, 8), (30, 2), (30, 21);

-- MARRAKECH (venues 31–40)
INSERT INTO venues_tags (venue_id, tag_id) VALUES
-- Comptoir Darna: live-music, dance-floor, reservation-required, vip-area, group-friendly
(31, 12), (31, 14), (31, 8), (31, 15), (31, 21),
-- La Mamounia Bar: garden, cocktails, valet-parking, dress-code-strict, date-night
(32, 16), (32, 11), (32, 7), (32, 29), (32, 20),
-- Kabana: pool, rooftop, live-dj, cocktails, terrace
(33, 6), (33, 4), (33, 1), (33, 11), (33, 5),
-- Le Jardin: garden, outdoor-seating, family-friendly, brunch
(34, 16), (34, 25), (34, 23), (34, 18),
-- Lotus Club: live-dj, dance-floor, vip-area, late-night, dress-code-strict
(35, 1), (35, 14), (35, 15), (35, 19), (35, 29),
-- So Night Lounge: pool, cocktails, live-dj, vip-area, late-night
(36, 6), (36, 11), (36, 1), (36, 15), (36, 19),
-- Bagatelle Marrakech: pool, live-dj, brunch, terrace, group-friendly
(37, 6), (37, 1), (37, 18), (37, 5), (37, 21),
-- Café Arabe: rooftop, terrace, cocktails, date-night, women-friendly
(38, 4), (38, 5), (38, 11), (38, 20), (38, 30),
-- Le Salama: rooftop, live-music, terrace, reservation-required, group-friendly
(39, 4), (39, 12), (39, 5), (39, 8), (39, 21),
-- 555 Famous Club: live-dj, dance-floor, vip-area, late-night, dress-code-strict
(40, 1), (40, 14), (40, 15), (40, 19), (40, 29);


-- ============================================================
-- COLLECTIONS (2 per city)
-- ============================================================
INSERT INTO collections (city_id, name, slug, description, venue_ids) VALUES
-- Casablanca
(1, 'Best Rooftops in Casablanca', 'best-rooftops-casablanca',
 'Elevate your evening at Casablanca''s finest rooftop venues. From the dizzying heights of Sky 28 to the oceanfront glamour of Blanco, these spots pair skyline views with world-class cocktails.',
 ARRAY[1, 5, 8]),

(1, 'Fine Dining Casablanca', 'fine-dining-casablanca',
 'Casablanca''s most refined tables, where Michelin-level artistry meets Moroccan hospitality. Reserve ahead — these seats are the most coveted in the kingdom.',
 ARRAY[2, 7, 3, 9]),

-- Rabat
(2, 'Waterfront Evenings in Rabat', 'waterfront-evenings-rabat',
 'Discover Rabat''s most enchanting waterfront venues. From the floating elegance of Le Dhow to the timeless charm of Café Maure perched above the Atlantic, the capital shines brightest by the water.',
 ARRAY[12, 17, 18]),

(2, 'Date Night in Rabat', 'date-night-rabat',
 'Intimate, atmospheric, and utterly romantic — these are Rabat''s best venues for a memorable date night. Candlelit riads, jazz clubs, and garden restaurants set the stage.',
 ARRAY[11, 13, 16, 20]),

-- Tangier
(3, 'Tangier Heritage Trail', 'tangier-heritage-trail',
 'Follow in the footsteps of Burroughs, the Rolling Stones, and Matisse through Tangier''s most storied venues. Each address carries a piece of the city''s legendary bohemian history.',
 ARRAY[21, 24, 26, 27]),

(3, 'Sea Views & Sunsets in Tangier', 'sea-views-sunsets-tangier',
 'Tangier was made for golden hour. These terraces and rooftops overlook the Strait of Gibraltar, serving up some of the most dramatic sunsets in all of the Mediterranean.',
 ARRAY[21, 22, 24, 25, 28]),

-- Marrakech
(4, 'Date Night in Marrakech', 'date-night-marrakech',
 'From palace bars to hidden garden restaurants, Marrakech offers the most romantic evening settings in North Africa. These venues combine candlelight, live music, and culinary artistry.',
 ARRAY[31, 32, 34, 38]),

(4, 'Best Pool Parties in Marrakech', 'best-pool-parties-marrakech',
 'When the Red City heats up, these pool venues deliver the perfect cool-down. International DJ sets, chilled rosé, and that unmistakable Marrakech energy — dive in.',
 ARRAY[33, 36, 37]);


COMMIT;
