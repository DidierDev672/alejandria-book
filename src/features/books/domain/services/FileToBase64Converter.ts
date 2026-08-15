// ============================================================
// DOMAIN SERVICE - File → Base64 (SRP)
// Convierte fotos y PDF a base64 para POST /digital-books.
// ============================================================

export class Base64ConversionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'Base64ConversionError'
  }
}

export class FileToBase64Converter {
  /**
   * Convierte un File a base64 puro (sin prefijo data:...).
   * @throws Base64ConversionError si la lectura falla
   */
  static fromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof File)) {
        reject(
          new Base64ConversionError(
            'No encontramos un archivo válido para convertir. Vuelve a seleccionarlo, por favor.',
          ),
        )
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        try {
          const result = String(reader.result ?? '')
          const base64 = this.extractBase64(result)
          if (!base64) {
            reject(
              new Base64ConversionError(
                `No pudimos preparar “${file.name}”. Prueba con otro archivo o un tamaño más pequeño.`,
              ),
            )
            return
          }
          resolve(base64)
        } catch {
          reject(
            new Base64ConversionError(
              `Algo salió mal al convertir “${file.name}”. No es tu culpa: inténtalo de nuevo en un momento.`,
            ),
          )
        }
      }

      reader.onerror = () => {
        reject(
          new Base64ConversionError(
            `No pudimos leer “${file.name}”. Revisa que el archivo no esté dañado y vuelve a intentarlo.`,
          ),
        )
      }

      reader.readAsDataURL(file)
    })
  }

  /** Convierte varios archivos a base64 en paralelo */
  static async fromFiles(files: File[]): Promise<string[]> {
    if (!files.length) {
      throw new Base64ConversionError(
        'Necesitamos al menos una foto de portada. Selecciona una imagen e inténtalo otra vez.',
      )
    }

    try {
      return await Promise.all(files.map((file) => this.fromFile(file)))
    } catch (error) {
      if (error instanceof Base64ConversionError) throw error
      throw new Base64ConversionError(
        'No pudimos convertir las fotos a un formato listo para guardar. Revisa las imágenes e inténtalo de nuevo.',
      )
    }
  }

  /** Extrae solo el tramo base64 de un data URL */
  static extractBase64(dataUrlOrBase64: string): string {
    const value = dataUrlOrBase64.trim()
    if (!value) return ''
    const comma = value.indexOf(',')
    if (value.startsWith('data:') && comma !== -1) {
      return value.slice(comma + 1)
    }
    return value
  }
}
