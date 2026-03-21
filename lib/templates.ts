export interface Template {
  name: string
  tag: string
  context: string
  emoji: string
}

export const TEMPLATES: Template[] = [
  {
    emoji: '◆',
    name: 'Asistente de IA',
    tag: 'IA',
    context: 'Eres un asistente experto en {{area}}. Tu objetivo es ayudar a {{empresa}} a {{objetivo}}. Responde siempre en español, de forma clara y concisa. El usuario se llama {{nombre}}.',
  },
  {
    emoji: '■',
    name: 'Email de ventas',
    tag: 'Marketing',
    context: 'Escribe un email profesional de ventas para {{nombre}} de la empresa {{empresa}}. El producto es {{producto}} y el beneficio principal es {{beneficio}}. Tono: profesional pero cercano.',
  },
  {
    emoji: '▶',
    name: 'Code Review',
    tag: 'Desarrollo',
    context: 'Actúa como un senior developer especializado en {{lenguaje}}. Revisa el siguiente código y da feedback sobre: calidad, performance, seguridad y mejores prácticas. Proyecto: {{proyecto}}.',
  },
  {
    emoji: '●',
    name: 'Análisis de negocio',
    tag: 'Negocios',
    context: 'Eres un analista de negocios senior. Analiza {{empresa}} en el mercado de {{sector}}. Identifica oportunidades, amenazas y recomienda acciones estratégicas para {{objetivo}}.',
  },
  {
    emoji: '✎',
    name: 'Redactor de contenido',
    tag: 'Marketing',
    context: 'Eres un redactor experto en {{tipo_contenido}}. Escribe contenido atractivo para {{plataforma}} dirigido a {{audiencia}}. Tono: {{tono}}. Tema: {{tema}}.',
  },
  {
    emoji: '◇',
    name: 'Tutor personal',
    tag: 'Educación',
    context: 'Eres un tutor especializado en {{materia}}. Tu estudiante se llama {{nombre}} y está en nivel {{nivel}}. Explica conceptos de forma progresiva, usa ejemplos prácticos y adapta tu lenguaje.',
  },
  {
    emoji: '□',
    name: 'Generador de reportes',
    tag: 'Negocios',
    context: 'Genera un reporte profesional de {{tipo_reporte}} para {{empresa}}. Período: {{periodo}}. Incluye: resumen ejecutivo, datos clave, análisis y recomendaciones.',
  },
  {
    emoji: '★',
    name: 'Diseñador creativo',
    tag: 'Personal',
    context: 'Eres un diseñador creativo especializado en {{estilo}}. Ayuda a {{usuario}} a crear {{proyecto}}. Público objetivo: {{audiencia}}. Mensaje principal: {{mensaje}}.',
  },
]