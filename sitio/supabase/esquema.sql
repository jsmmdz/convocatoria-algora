-- Esquema de la convocatoria Algora para Supabase.
-- Cómo usarlo: Supabase > SQL Editor > New query > pega todo este archivo > Run.
-- Se puede correr más de una vez sin romper nada.
--
-- Reglas de seguridad:
--   · Cualquiera (anon) puede ENVIAR una postulación, pero no puede leer ninguna.
--   · La hélice pública solo recibe idea, regla, modelo, facultad y perfiles faltantes,
--     y solo de las ideas que el equipo aprobó (nunca nombre ni correo).
--   · Solo las personas inscritas en la tabla "equipo" pueden ver, aprobar y borrar postulaciones.

create extension if not exists pgcrypto;

create table if not exists public.postulaciones (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  tipo             text not null check (tipo in ('idea', 'equipo')),
  nombre           text not null check (char_length(nombre) between 2 and 120),
  correo           text not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(correo) <= 160),
  area             text not null check (char_length(area) <= 80),
  programa         text not null check (char_length(programa) <= 120),
  -- con idea
  idea             text check (char_length(idea) <= 60),
  regla            text check (char_length(regla) <= 120),
  modelo           text check (char_length(modelo) <= 60),
  publico          text check (char_length(publico) <= 160),
  faltan           text[] not null default '{}' check (cardinality(faltan) <= 10),
  publicar         boolean not null default false,
  -- para sumarse
  proyecto         text check (char_length(proyecto) <= 80),
  habilidades      text[] not null default '{}' check (cardinality(habilidades) <= 12),
  horas            int check (horas between 1 and 40),
  portafolio       text check (char_length(portafolio) <= 300),
  motivacion       text check (char_length(motivacion) <= 1000),
  -- consentimiento y moderación
  consentimiento   boolean not null check (consentimiento),
  aprobada         boolean not null default false,
  equipo_completo  boolean not null default false,
  notas            text,
  constraint idea_completa check (tipo <> 'idea' or (idea is not null and regla is not null))
);

create index if not exists postulaciones_creada on public.postulaciones (created_at desc);

-- Personas del semillero con acceso al panel (/equipo/).
create table if not exists public.equipo (
  user_id uuid primary key references auth.users (id) on delete cascade,
  correo  text,
  agregado timestamptz not null default now()
);

create or replace function public.es_equipo()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.equipo where user_id = auth.uid()) $$;

alter table public.postulaciones enable row level security;
alter table public.equipo enable row level security;

-- Postular: cualquiera, pero no puede auto-aprobarse.
drop policy if exists "postular" on public.postulaciones;
create policy "postular" on public.postulaciones
  for insert to anon, authenticated
  with check (aprobada = false and equipo_completo = false and notas is null);

-- Leer, moderar y borrar: solo el equipo.
drop policy if exists "equipo lee" on public.postulaciones;
create policy "equipo lee" on public.postulaciones for select to authenticated using (public.es_equipo());
drop policy if exists "equipo modera" on public.postulaciones;
create policy "equipo modera" on public.postulaciones for update to authenticated using (public.es_equipo()) with check (public.es_equipo());
drop policy if exists "equipo borra" on public.postulaciones;
create policy "equipo borra" on public.postulaciones for delete to authenticated using (public.es_equipo());

drop policy if exists "equipo se ve" on public.equipo;
create policy "equipo se ve" on public.equipo for select to authenticated using (public.es_equipo());

revoke all on public.postulaciones from anon;
grant insert on public.postulaciones to anon;
grant insert, select, update, delete on public.postulaciones to authenticated;
revoke all on public.equipo from anon;

-- Anillo público: solo campos sin datos personales, solo ideas aprobadas.
create or replace function public.proyectos_publicos()
returns table (id uuid, idea text, regla text, modelo text, area text, faltan text[], equipo_completo boolean, creada timestamptz)
language sql stable security definer set search_path = public
as $$
  select id, idea, regla, modelo, area, faltan, equipo_completo, created_at
  from public.postulaciones
  where tipo = 'idea' and publicar and aprobada
  order by created_at desc
  limit 40
$$;

revoke execute on function public.proyectos_publicos() from public;
grant execute on function public.proyectos_publicos() to anon, authenticated;

-- Para darle acceso al panel a alguien:
--   1. Supabase > Authentication > Users > Add user (correo y contraseña).
--   2. Corre esto con su correo:
--   insert into public.equipo (user_id, correo)
--   select id, email from auth.users where email = 'correo@unbosque.edu.co'
--   on conflict do nothing;
