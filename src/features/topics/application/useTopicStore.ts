import { defineStore } from "pinia";
import { ref } from "vue";
import type { Topic } from "../domain/entities/Topic";
import { AxiosTopicRepository } from "../infrastructure/repositories/AxiosTopicRepository";

const topicRepository = new AxiosTopicRepository();

export const useTopicStore = defineStore("topics", () => {
  const topicsList = ref<Topic[]>([]);
  const isSubmitting = ref<boolean>(false);
  const isLoadingList = ref<boolean>(false);
  const feedbackError = ref<string | null>(null);

  async function createTopic(topic: Topic): Promise<boolean> {
    isSubmitting.value = true;
    feedbackError.value = null;

    try {
      await topicRepository.save({
        ...topic,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (error: any) {
      feedbackError.value =
        error.response?.data?.message ||
        "No se pudo registrar el tema de estudio.";
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function loadTopics(): Promise<void> {
    isLoadingList.value = true;
    feedbackError.value = null;

    try {
      topicsList.value = (await topicRepository.findAll()) ?? [];
    } catch (error: any) {
      feedbackError.value = "Error al cargar los temas de estudio.";
    } finally {
      isLoadingList.value = false;
    }
  }

  return {
    topicsList,
    isSubmitting,
    isLoadingList,
    feedbackError,
    createTopic,
    loadTopics,
  };
});
