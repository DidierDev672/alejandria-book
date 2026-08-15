// ============================================================
// DOMAIN SERVICE - Endpoint Spanish Glossary (SRP)
// Glosario de traducción EN→ES para valores típicos de
// GET /members y GET /exercises. El Coach debe presentar
// al entrenador las etiquetas en español.
// ============================================================

export class EndpointSpanishGlossary {
  /** Bloque inyectable en el system prompt con tablas de traducción */
  static toSystemContext(): string {
    return (
      '\n\nGLOSARIO DE TRADUCCIÓN AL ESPAÑOL (obligatorio en tus respuestas al entrenador):\n' +
      'Aunque el JSON de los endpoints venga en inglés o en códigos, en tu respuesta escribe siempre la etiqueta en español (sin claves técnicas del JSON).\n\n' +
      'GET /exercises → difficulty (escribe "dificultad …", nunca `difficulty=`):\n' +
      '- BEGINNER → principiante\n' +
      '- INTERMEDIATE → intermedia\n' +
      '- ADVANCED → avanzada\n\n' +
      'GET /exercises → muscle_group (escribe "grupo muscular …", nunca `muscle_group=`):\n' +
      '- chest / pectorales → pectorales\n' +
      '- back → espalda\n' +
      '- shoulders → hombros\n' +
      '- biceps → bíceps\n' +
      '- triceps → tríceps\n' +
      '- legs / quads / hamstrings / glutes / calves → piernas / cuádriceps / isquiotibiales / glúteos / pantorrillas\n' +
      '- core / abs → core / abdominales\n' +
      '- cardio → cardio\n' +
      '- full body → cuerpo completo\n' +
      'Formato visible: "grupo muscular pectorales, dificultad intermedia, equipamiento: Banco plano".\n\n' +
      'GET /equipment → status:\n' +
      '- active → activo\n' +
      '- inactive → inactivo\n' +
      '- pending → pendiente\n' +
      'GET /equipment → type: traduce al español si viene en inglés (machine→máquina, free_weight→peso libre, cardio→cardio, etc.).\n' +
      'En la rutina muestra el name del equipo, no el id. Puedes mencionar el estado solo si no está activo.\n\n' +
      'GET /members → goals.goal_type:\n' +
      '- PERDIDA_PESO → Pérdida de peso\n' +
      '- GANANCIA_MUSCULAR → Ganancia muscular\n' +
      '- RESISTENCIA → Resistencia\n' +
      '- MANTENIMIENTO → Mantenimiento\n' +
      '- REHABILITACION → Rehabilitación\n\n' +
      'GET /members → health_conditions.severity:\n' +
      '- LEVE → Leve\n' +
      '- MODERADO → Moderado\n' +
      '- GRAVE → Grave\n\n' +
      'GET /members → mental_health.mood:\n' +
      '- POSITIVO → Positivo\n' +
      '- NEUTRO → Neutro\n' +
      '- NEGATIVO → Negativo\n\n' +
      'GET /members → genre:\n' +
      '- masculino → Masculino\n' +
      '- femenino → Femenino\n' +
      '- otro → Otro\n\n' +
      'GET /members → type_document:\n' +
      '- CC → Cédula de ciudadanía\n' +
      '- TI → Tarjeta de identidad\n' +
      '- TARJETA_EXTRANJERO → Tarjeta de extranjería\n\n' +
      'Booleans y unidades:\n' +
      '- is_achieved: true/false → alcanzado / pendiente\n' +
      '- is_active: true/false → activa / inactiva\n' +
      '- weight_kg, height_cm, etc. → presenta con unidad en español (kg, cm, %, horas de sueño)\n' +
      '- Nombres de ejercicios (`name`): si están en inglés, tradúcelos al español en la lectura ' +
      'y puedes conservar el name original entre comillas (ej. Press de banca — "Bench Press").\n' +
      '- Incluye el enlace video_url de cada ejercicio recomendado.\n' +
      '- NUNCA muestres id, equipment_id ni UUIDs en la respuesta al entrenador.'
    )
  }
}
