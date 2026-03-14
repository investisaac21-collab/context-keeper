# Context Keeper

App para gestionar proyectos con contexto, variables dinamicas y plantillas predefinidas.

## Stack
- Next.js 14 (App Router)
- Supabase (Auth Google + DB)
- Tailwind CSS
- Vercel (Deploy)

## Features
- Login con Google OAuth
- Crear/editar/eliminar proyectos con nombre, categoria y contexto
- Variables dinamicas tipo {{nombre}} con relleno antes de copiar
- Boton copiar con un click
- Plantillas predefinidas (IA, Marketing, Dev, Negocios...)
- Exportar/Importar JSON

## Setup env vars
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

## Deploy
Connected to Vercel - auto deploy on push.