export interface Template {
    name: string
      tag: string
        context: string
          emoji: string
          }

          export const TEMPLATES: Template[] = [
            {
                emoji: '🤖',
                    name: 'Asistente de IA',
                        tag: 'IA',
                            context: 'Eres un asistente experto en {{area}}. Tu objetivo es ayudar a {{empresa}} a {{objetivo}}. Responde siempre en español, de forma clara y concisa. El usuario se llama {{nombre}}.',
                              },
                                {
                                    emoji: '📧',
                                        name: 'Email de ventas',
                                            tag: 'Marketing',
                                                context: 'Escribe un email profesional de ventas para {{nombre}} de la empresa {{empresa}}. El producto es {{producto}} y el beneficio principal es {{beneficio}}. Tono: profesional pero cercano.',
                                                  },
                                                    {
                                                        emoji: '💻',
                                                            name: 'Code Review',
                                                                tag: 'Desarrollo',
                                                                    context: 'Actua como un senior developer especializado en {{lenguaje}}. Revisa el siguiente codigo y da feedback sobre: calidad, performance, seguridad y mejores practicas. Proyecto: {{proyecto}}.',
                                                                      },
                                                                        {
                                                                            emoji: '📊',
                                                                                name: 'Analisis de negocio',
                                                                                    tag: 'Negocios',
                                                                                        context: 'Analiza la siguiente situacion de negocio para {{empresa}} en el sector {{sector}}. Identifica oportunidades, riesgos y recomienda acciones concretas. Objetivo: {{objetivo}}.',
                                                                                          },
                                                                                            {
                                                                                                emoji: '📝',
                                                                                                    name: 'Generador de contenido',
                                                                                                        tag: 'Marketing',
                                                                                                            context: 'Crea contenido para {{plataforma}} sobre {{tema}}. La audiencia objetivo es {{audiencia}}. Tono: {{tono}}. Incluye un call to action para {{accion}}.',
                                                                                                              },
                                                                                                                {
                                                                                                                    emoji: '🎓',
                                                                                                                        name: 'Tutor educativo',
                                                                                                                            tag: 'Educacion',
                                                                                                                                context: 'Eres un tutor experto en {{materia}}. Explica {{concepto}} de forma sencilla para alguien con nivel {{nivel}}. Usa ejemplos practicos y analogias. El alumno tiene {{edad}} anos.',
                                                                                                                                  },
                                                                                                                                  ]
}