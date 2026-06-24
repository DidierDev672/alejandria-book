import { reactive, ref } from "vue";
import type { UserEntity } from "../domain/UserEntity";
import { UserValidator } from "../domain/validators/UserValidator";


export const useRegisterForm = () => {
    const user = reactive<UserEntity>({
        fullName: '',
        phone: '',
        idNumber: '',
        birthDate: '',
        email: '',
        password: '',
    });
    const errors = ref<{ [key: string]: string }>({});
    const showPassword = ref(false);
    const isLoading = ref(false);
    const submitSuccess = ref(false);


    const validateForm = () => {
        const validationErrors = UserValidator.validate(user);
        errors.value = validationErrors;
        return Object.keys(validationErrors).length === 0;
    }


    const handleSubmit = async () => {
        if (!validateForm()) {
            console.warn(`Formulario con errores: ${JSON.stringify(errors.value)}`);
            return;
        };

        isLoading.value = true;
        submitSuccess.value = false;

        // Simular llamado a API
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Usuario registrado correctamente', user);
            submitSuccess.value = true;
        } catch (error) {
            console.error(`Error al registrar usuario: ${error}`);
        } finally {
            isLoading.value = false;
        }
    }

    const togglePasswordVisibility = () => {
        showPassword.value = !showPassword.value;
    }


    // Función para resetear errores de un campo al modificarlo
    const clearFieldError = (field: string) => {
        if (errors.value[field]) {
            delete errors.value[field];

            errors.value = { ...errors.value };
        }
    };


    return {
        user,
        errors,
        showPassword,
        isLoading,
        submitSuccess,
        validateForm,
        handleSubmit,
        togglePasswordVisibility,
        clearFieldError,
    }
}