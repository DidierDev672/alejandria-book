// ============================================================
// DOMAIN SERVICE - Friendly feedback copy for workout POST results
// ============================================================

export interface FeedbackCopy {
  title: string
  message: string
  cause?: string
  nextStep?: string
}

const SUCCESS_VARIANTS: FeedbackCopy[] = [
  {
    title: '¡Rutina registrada con éxito!',
    message:
      'El plan ya forma parte del camino de tu gladiador. Cada sesión registrada es una promesa cumplida: claridad para él y tranquilidad para ti.',
  },
  {
    title: '¡Entrenamiento inscrito en el Coliseo!',
    message:
      'Acabas de convertir una intención en un plan concreto. Los entrenadores que documentan así no improvisan: construyen resultados.',
  },
  {
    title: '¡Listo! La rutina quedó guardada',
    message:
      'Tu gladiador ya tiene una hoja de ruta. Ese pequeño acto de organización es lo que separa el esfuerzo del progreso real.',
  },
]

/**
 * Traduce un error técnico a un mensaje empático (psicología):
 * reduce culpa, explica causa plausible y ofrece un siguiente paso concreto.
 */
export class WorkoutFeedbackMessages {
  static success(routineName?: string): FeedbackCopy {
    const variant =
      SUCCESS_VARIANTS[Math.floor(Math.random() * SUCCESS_VARIANTS.length)]

    if (routineName) {
      return {
        ...variant,
        message: `"${routineName}" — ${variant.message}`,
      }
    }
    return variant
  }

  /** Feedback tras PUT /colesio/workouts/{id} */
  static updateSuccess(routineName?: string): FeedbackCopy {
    const nameSuffix = routineName ? ` "${routineName}"` : ''
    return {
      title: '¡Rutina actualizada con éxito!',
      message: `Los cambios de${nameSuffix} ya quedaron guardados en el Coliseo. Tu gladiador entrenará con la versión más reciente del plan.`,
    }
  }

  /**
   * Advertencia previa a DELETE (psicología amigable):
   * sin culpa, con consecuencias claras y permiso para cancelar.
   */
  static deleteWarning(routineName?: string, memberName?: string | null): FeedbackCopy {
    const planLabel = routineName ? `"${routineName}"` : 'este plan'
    const athleteLabel = memberName ? ` de ${memberName}` : ' de tu gladiador'

    return {
      title: '¿Seguro que quieres soltar este plan?',
      message: `Eliminar ${planLabel} no te hace un mal entrenador: a veces soltar un plan antiguo abre espacio para uno mejor. Aun así, conviene pausar un segundo.`,
      cause: `Si continúas, ${planLabel}${athleteLabel} dejará de aparecer en el Coliseo. Se perderá la asignación (fechas, ejercicios y estado) y no podrás recuperarla desde aquí.`,
      nextStep:
        'Si solo quieres ajustar algo, cancela y usa Editar. Si el plan ya no aporta, puedes eliminarlo con tranquilidad: siempre podrás crear uno nuevo cuando estés listo.',
    }
  }

  /** Feedback tras DELETE /colesio/workouts/{id} */
  static deleteSuccess(routineName?: string): FeedbackCopy {
    const nameSuffix = routineName ? ` "${routineName}"` : ''
    return {
      title: 'La rutina ya no está en el Coliseo',
      message: `Eliminaste${nameSuffix} con cuidado. Ese espacio libre también es progreso: ahora puedes diseñar el siguiente plan con más claridad.`,
    }
  }

  static fromError(rawError: string | null | undefined): FeedbackCopy {
    const error = (rawError ?? '').toLowerCase()

    if (
      error.includes('no fueron encontrados') ||
      error.includes('no encontrado') ||
      error.includes('404')
    ) {
      return {
        title: 'No encontramos uno de los datos clave',
        message:
          'No pasa nada: esto suele ocurrir cuando el miembro, la rutina o algún ejercicio ya no están disponibles en el catálogo.',
        cause:
          'Es posible que el ID haya cambiado, que el registro se haya archivado, o que se haya seleccionado un elemento desactualizado.',
        nextStep:
          'Vuelve a seleccionar el miembro, la rutina base y los ejercicios desde los selectores, y vuelve a intentarlo. Estás a un paso.',
      }
    }

    if (
      error.includes('ya existe') ||
      error.includes('409') ||
      error.includes('conflicto')
    ) {
      return {
        title: 'Esa combinación ya está registrada',
        message:
          'Buen ojo: el Coliseo evitó un duplicado. Eso significa que el sistema está cuidando la integridad de tus planes.',
        cause:
          'Probablemente este miembro ya tiene un entrenamiento con el mismo nombre o la misma rutina en el mismo período.',
        nextStep:
          'Prueba con otro nombre, ajusta las fechas o revisa si el plan que buscabas ya quedó creado. No perdiste el trabajo: solo hay que afinarlo.',
      }
    }

    if (
      error.includes('no son válidos') ||
      error.includes('422') ||
      error.includes('400') ||
      error.includes('validación')
    ) {
      return {
        title: 'Falta un detalle para completar el registro',
        message:
          'Estás muy cerca. Los formularios a veces piden un ajuste pequeño antes de aceptar el plan — y eso es normal.',
        cause:
          'Puede faltar un campo, la fecha de fin no ser posterior a la de inicio, o algún dato no cumplir el formato esperado.',
        nextStep:
          'Revisa los campos marcados (miembro, rutina, ejercicios y fechas). Un pequeño ajuste y el plan queda listo.',
      }
    }

    if (
      error.includes('network') ||
      error.includes('timeout') ||
      error.includes('econnrefused') ||
      error.includes('failed to fetch') ||
      error.includes('conexión')
    ) {
      return {
        title: 'Se cortó la conexión un momento',
        message:
          'Esto no dice nada de tu trabajo: a veces la red o el servidor responden tarde. Tu esfuerzo no se pierde por un tropiezo técnico.',
        cause:
          'Es posible que el servicio esté reiniciándose, que haya una microcorte de red o que la sesión haya expirado.',
        nextStep:
          'Espera unos segundos, verifica tu conexión e inténtalo de nuevo. Si persiste, vuelve a iniciar sesión y reintenta.',
      }
    }

    if (error.includes('sesión') || error.includes('401') || error.includes('unauthorized')) {
      return {
        title: 'Tu sesión necesita renovarse',
        message:
          'Por seguridad, el Coliseo pidió volver a identificarte. Es una protección, no un castigo.',
        cause:
          'El token de acceso pudo haber expirado mientras completabas el formulario.',
        nextStep:
          'Inicia sesión de nuevo y vuelve a enviar la rutina. Tus datos del formulario siguen ahí si no cerraste la pestaña.',
      }
    }

    return {
      title: 'No pudimos guardar la rutina esta vez',
      message:
        'Respira: un fallo puntual no borra el buen plan que construiste. Casi siempre es algo corregible en un momento.',
      cause:
        rawError?.trim()
          ? `Detalle técnico: ${rawError.trim()}`
          : 'Pudo tratarse de una interrupción temporal del servicio o de un dato que el servidor no pudo procesar.',
      nextStep:
        'Revisa los datos del formulario e inténtalo otra vez. Si el mensaje se repite, anota qué seleccionaste y vuelve a intentarlo en unos minutos.',
    }
  }
}
