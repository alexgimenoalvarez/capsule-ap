-- À exécuter dans l'éditeur SQL du projet Supabase (une seule fois).
-- Activer l'authentification e-mail dans Authentication > Providers.
create table if not exists public.progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
create table if not exists public.suggestions (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 category text not null check (category in ('question','content','feature','other')),
 message text not null check (char_length(message) between 8 and 3000),
 lesson_id text,
 created_at timestamptz not null default now()
);
alter table public.progress enable row level security;
alter table public.suggestions enable row level security;
drop policy if exists "Lire sa progression" on public.progress;
create policy "Lire sa progression" on public.progress for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Enregistrer sa progression" on public.progress;
create policy "Enregistrer sa progression" on public.progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Mettre a jour sa progression" on public.progress;
create policy "Mettre a jour sa progression" on public.progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Envoyer sa suggestion" on public.suggestions;
create policy "Envoyer sa suggestion" on public.suggestions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Lire ses suggestions" on public.suggestions;
create policy "Lire ses suggestions" on public.suggestions for select to authenticated using (auth.uid() = user_id);
-- Administrateur : consulter les suggestions directement dans Table Editor de Supabase.
-- Pas de lecture publique des suggestions d'autres étudiants.
