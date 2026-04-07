
-- Supprimer les données des tables
DELETE FROM public.profiles;
DELETE FROM public.leaderboard;
-- Pour réinitialiser les utilisateurs auth
-- (attention : ça supprime les utilisateurs mais pas les données liées aux clés étrangères)
DELETE FROM auth.users;

-- Désactiver les contraintes

DELETE FROM public.profiles;
DELETE FROM public.leaderboard;
DELETE FROM auth.users;
-- Réactiver les contraintes
