// ============================================================
// DOMAIN SERVICE - Friendly feedback copy for digital books
// ============================================================

export interface DigitalBookFeedbackCopy {
  title: string
  message: string
}

export class DigitalBookFeedbackMessages {
  static success(bookName?: string): DigitalBookFeedbackCopy {
    const name = bookName?.trim()
    return {
      title: '¡Libro digital guardado!',
      message: name
        ? `“${name}” ya forma parte de tu biblioteca digital. Puedes seguir registrando más obras cuando quieras.`
        : 'Tu libro digital se almacenó con éxito. Ya está listo en la biblioteca.',
    }
  }

  static fromBase64Error(raw?: string): DigitalBookFeedbackCopy {
    return {
      title: 'No pudimos preparar los archivos',
      message:
        raw?.trim() ||
        'Hubo un problema al convertir la portada o el PDF. Revisa los archivos (que no estén corruptos ni sean demasiado grandes) y vuelve a intentarlo.',
    }
  }

  static emptyLibrary(): DigitalBookFeedbackCopy {
    return {
      title: 'Tu estantería todavía espera su primer libro',
      message:
        'Esto no es un fallo: Alejandría ya está lista, solo que aún no hay obras en esta sala. El silencio es una invitación. Cuando registres el primero, este espacio se llenará de portadas, autores y géneros —a tu ritmo, sin prisa.',
    }
  }

  static loadDetailError(): DigitalBookFeedbackCopy {
    return {
      title: 'Este libro no se pudo abrir ahora',
      message:
        'No es tu culpa. Puede que la ficha no esté disponible o que la sala esté un momento en silencio. Vuelve a la estantería y elige de nuevo; si el problema sigue, espera un poco e inténtalo otra vez.',
    }
  }

  static pdfContentError(): DigitalBookFeedbackCopy {
    return {
      title: 'Las páginas se quedaron a medias',
      message:
        'El libro está en tu biblioteca, pero no pudimos desplegar su contenido. El archivo puede haber llegado incompleto o en un formato que aún no abrimos. El resto de la ficha sigue aquí; puedes volver más tarde o elegir otra obra.',
    }
  }

  static translationBooting(): DigitalBookFeedbackCopy {
    return {
      title: 'Estamos despertando a llama3',
      message:
        'Ollama aún no estaba en la sala. Lo estamos iniciando con calma (ollama run llama3). No tienes que hacer nada: como encender la lámpara de una biblioteca.',
    }
  }

  static translationInProgress(languageLabel: string): DigitalBookFeedbackCopy {
    return {
      title: `llama3 está traduciendo al ${languageLabel}`,
      message:
        'El modelo está leyendo el libro por ti. Puede tardar un poco si hay muchas páginas. Quédate: las palabras están de camino.',
    }
  }

  static translationRendering(): DigitalBookFeedbackCopy {
    return {
      title: 'Colocando la traducción en la página',
      message:
        'La traducción ya está lista. La estamos sentando en la sección de contenido, línea a línea. Un instante más.',
    }
  }

  static translationUnavailable(): DigitalBookFeedbackCopy {
    return {
      title: 'No pudimos despertar a llama3',
      message:
        'No es un problema de tu libro. Ollama no respondió al llamado. Si puedes, ejecuta ollama run llama3 en tu equipo y vuelve a pulsar Español o Inglés.',
    }
  }

  static fromListHttpError(status?: number, raw?: string): DigitalBookFeedbackCopy {
    if (status === 401 || status === 403) {
      return {
        title: 'Necesitamos que inicies sesión',
        message:
          'Tu sesión puede haber caducado. Vuelve a entrar y abre de nuevo tu biblioteca digital.',
      }
    }
    if (status && status >= 500) {
      return {
        title: 'El servidor está un poco ocupado',
        message:
          'No es un problema de tu biblioteca. Espera un momento e intenta cargar los libros otra vez.',
      }
    }
    return {
      title: 'No pudimos abrir la biblioteca',
      message:
        raw?.trim() ||
        'Se presentó un inconveniente al cargar tus libros digitales. Inténtalo de nuevo; si continúa, vuelve un poco más tarde.',
    }
  }

  static fromHttpError(status?: number, raw?: string): DigitalBookFeedbackCopy {
    if (status === 400 || status === 422) {
      return {
        title: 'Revisa la información del libro',
        message:
          'Algunos datos no se ven completos o válidos. Comprueba el título, el autor, los géneros, la portada y el PDF, y vuelve a enviar.',
      }
    }
    if (status === 401 || status === 403) {
      return {
        title: 'Necesitamos que inicies sesión',
        message:
          'Tu sesión puede haber caducado. Vuelve a entrar y prueba registrar el libro otra vez.',
      }
    }
    if (status === 409) {
      return {
        title: 'Este libro ya existe',
        message:
          'Parece que ya hay un libro digital parecido en la biblioteca. Cambia el título o revisa si ya lo registraste.',
      }
    }
    if (status && status >= 500) {
      return {
        title: 'El servidor está un poco ocupado',
        message:
          'No es un problema de tus datos. Espera un momento e intenta guardar el libro de nuevo.',
      }
    }

    return {
      title: 'No pudimos guardar el libro',
      message:
        raw?.trim() ||
        'Se presentó un error al registrar el libro digital. Revisa la información e inténtalo otra vez; si el problema continúa, vuelve más tarde.',
    }
  }
}
