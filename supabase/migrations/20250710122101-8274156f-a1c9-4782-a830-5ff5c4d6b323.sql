-- Make latitude and longitude nullable for spots that don't have coordinates yet
ALTER TABLE public.spots 
ALTER COLUMN latitude DROP NOT NULL,
ALTER COLUMN longitude DROP NOT NULL;

-- Insert Israeli surf spots, skipping any that already exist
INSERT INTO public.spots (name, country) VALUES
('Hilton Beach', 'Israel'),
('Dolphinarium', 'Israel'),
('Tel Baruch', 'Israel'),
('Bat Yam Beach', 'Israel'),
('Herzliya Beach', 'Israel'),
('Sidna Ali', 'Israel'),
('Beit Yanai Beach', 'Israel'),
('Netanya Beach', 'Israel'),
('Sironit Beach', 'Israel'),
('Poleg Beach', 'Israel'),
('Michmoret Beach', 'Israel'),
('Caesarea Beach', 'Israel'),
('Dor Beach', 'Israel'),
('Atlit Beach', 'Israel'),
('Haifa Beach', 'Israel'),
('Dado Beach', 'Israel'),
('Bat Galim', 'Israel'),
('Kiryat Haim Beach', 'Israel'),
('Kiryat Yam Beach', 'Israel'),
('Akhziv Beach', 'Israel'),
('Nahariya Beach', 'Israel'),
('Palmachim Beach', 'Israel'),
('Ashdod Beach', 'Israel'),
('Ashkelon Beach', 'Israel'),
('Zikim Beach', 'Israel'),
('Hof Palmahim', 'Israel'),
('Rishon LeZion Beach', 'Israel'),
('Givat Olga Beach', 'Israel'),
('Shavei Tzion Beach', 'Israel'),
('Sdot Yam Beach', 'Israel'),
('Nitzanim Beach', 'Israel')
ON CONFLICT (name) DO NOTHING;