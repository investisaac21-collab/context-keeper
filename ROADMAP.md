# Keeper — Roadmap de Fases

## Fase 1: IA Nativa (ACTUAL) ✅
**Objetivo:** Integrar generación con IA en todas las funcionalidades core de Keeper.

### Completado
- [x] Keeper Lab: análisis de contextos con IA (score, mejoras, versión optimizada)
- [x] Generar contexto con IA en el modal de nuevo contexto (/api/generate-prompt)
- [x] Chat con Keeper Profiles (chat-profile endpoint con Groq)
- [x] Generación automática de perfiles IA completos (/api/generate-profile)
- [x] GIF/Avatar para Keeper Profiles

### En progreso
- [ ] Despliegue de AI Profiles en producción (esperando reset límite Vercel)
- [ ] Banner de upgrade visible para plan Free en dashboard

---

## Fase 2: Mini Asistente Keeper (SIGUIENTE)
**Objetivo:** Crear un asistente IA propio dentro de Keeper, con acceso directo desde el dashboard.

### Features planeados
- [ ] **Keeper Bot (mini asistente):** Widget flotante en el dashboard con acceso rápido
  - Responde preguntas sobre tus contextos y perfiles guardados
  - Sugiere contextos relevantes para la tarea actual
  - Puede crear, editar y organizar contextos por comandos de voz/texto
- [ ] **Generación contextual:** El bot analiza lo que el usuario está haciendo y propone contextos relevantes
- [ ] **Historial de conversaciones** con el bot guardado en Supabase
- [ ] **Modo rápido:** Atajo de teclado (Cmd+K / Ctrl+K) para abrir el bot instantáneamente

---

## Fase 3: Integración ChatGPT (FUTURO)
**Objetivo:** Conectar Keeper directamente con ChatGPT para que el contexto se envíe automáticamente sin copiar y pegar.

### Features planeados
- [ ] **Custom GPT de Keeper:** Crear un GPT personalizado en ChatGPT que use la API de Keeper para acceder a los contextos del usuario
- [ ] **OAuth connection:** Autorizar a Keeper para escribir directamente en el chat de ChatGPT via Actions
- [ ] **Bot local:** Extensión de Chrome que inyecta el contexto de Keeper automáticamente cuando el usuario abre ChatGPT, Claude o Gemini
- [ ] **One-click paste:** Botón en el dashboard que abre ChatGPT con el contexto ya cargado (usando URL params o clipboard API)
- [ ] **Compatibilidad multi-IA:** Soporte para ChatGPT, Claude, Gemini, Perplexity

---

## Stack Técnico
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS), Vercel Serverless
- **IA:** Groq API (llama-3.1-8b-instant, llama-3.3-70b-versatile)
- **Pagos:** Stripe (planes Free/Pro/Team)
- **Precios:** Free, Pro 9 €/mes, Team 20 €/mes


<!-- trigger 1774127611947 -->