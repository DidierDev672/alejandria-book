import type { UserEntity } from "../UserEntity";
export class UserValidator {
  static validate(userEntity: UserEntity) {
    const errors: Record<string, string> = {};

    if (!userEntity.fullName || userEntity.fullName.trim().length < 3) {
      errors.fullName = "El nombre completo debe tener al menos 3 caracteres";
    }

    if (!userEntity.phone || !/^\d{10,15}$/.test(userEntity.phone)) {
      errors.phone = "El número de teléfono debe tener entre 10 y 15 dígitos";
    }

    if (!userEntity.idNumber || userEntity.idNumber.trim().length < 4) {
      errors.idNumber = "El numero de identificacion es obligatorio";
    }

    if (!userEntity.birthDate) {
      errors.birthDate = "La fecha de nacimiento es obligatoria";
    } else {
      const age = this.calculateAge(userEntity.birthDate);
      if (age < 18) {
        errors.birthDate = "Debes tener al menos 18 años";
      }
    }

    if (
      !userEntity.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEntity.email)
    ) {
      errors.email = "Correo electrónico inválido";
    }

    if (!userEntity.password || userEntity.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return errors;
  }

  static calculateAge(birthDate: string) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}
