import { defineStore } from "pinia";
import { ref } from "vue";
import type { Book } from "../domain/entities/Book";
import { AxiosBookRepository } from "../infrastructure/repositories/AxiosBookRepository";

const bookRepository = new AxiosBookRepository();

export const useBookStore = defineStore("books", () => {
  const booksList = ref<Book[]>([]);
  const isSubmitting = ref<boolean>(false);
  const isLoadingList = ref<boolean>(false);
  const feedbackError = ref<string | null>(null);

  async function registerBook(book: Book): Promise<boolean> {
    isSubmitting.value = true;
    feedbackError.value = null;

    try {
      await bookRepository.save({
        ...book,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return true;
    } catch (error: any) {
      feedbackError.value =
        error.response?.data?.message || "No se pudo registrar el libro.";
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function loadBooks(): Promise<void> {
    isLoadingList.value = true;
    feedbackError.value = null;

    try {
      booksList.value = (await bookRepository.findAll()) ?? [];
    } catch (error: any) {
      feedbackError.value = "Error al cargar los libros.";
    } finally {
      isLoadingList.value = false;
    }
  }

  return {
    booksList,
    isLoadingList,
    isSubmitting,
    feedbackError,
    registerBook,
    loadBooks,
  };
});
