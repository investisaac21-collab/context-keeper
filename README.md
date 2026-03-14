# Context Keeper

App para gestionar proyectos con contexto, variables dinamicas y plantillas.

## Stack: Next.js 14 + Supabase + Tailwind + Vercel

## Build fixes applied:
- Array.from(new Set()) for TypeScript ES2017 compat
- (window as any) for window property access
- tsconfig target ES2017
- lib/supabase.ts simplified

## Features
- Login con Google OAuth
- CRUD proyectos con nombre, categoria y contexto
- Variables dinamicas tipo {{nombre}}
- Boton copiar con relleno automatico
- Plantillas predefinidas
- Exportar/Importar JSON