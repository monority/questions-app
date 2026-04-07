-- ==========================================
-- CULTURE QUIZ - SETUP SUPABASE
-- ==========================================

-- 1. ACTIVER RLS SUR LES TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 2. POLICY POUR PROFILES
-- Lecture : utilisateur voit son propre profil
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Insertion : utilisateur crée son propre profil
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Mise à jour : utilisateur modifie son propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. POLICY POUR LEADERBOARD
-- Lecture : tout le monde peut voir le leaderboard
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON leaderboard;
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- Insertion/Mise à jour : seul l'utilisateur concerné
DROP POLICY IF EXISTS "Users can upsert own score" ON leaderboard;
CREATE POLICY "Users can upsert own score" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own score" ON leaderboard;
CREATE POLICY "Users can update own score" ON leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. NETTOYER LES DOUBLONS (garder seulement le meilleur score par utilisateur)
DELETE FROM leaderboard
WHERE id NOT IN (
  SELECT MIN(id)
  FROM leaderboard
  GROUP BY user_id
);

-- 5. CRÉER CONTRAINTE UNIQUE SUR LEADERBOARD
ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_user_id_key UNIQUE (user_id);

-- 6. AJOUTER COLONNE total_score SI PAS DÉJÀ FAIT
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;