import axiosInstance from "@/infrastructure/http/axiosInstance";
import type { TopicRepository } from "../../domain/repositories/TopicRepository";
import type { Topic } from "../../domain/entities/Topic";

export class AxiosTopicRepository implements TopicRepository {
  private readonly apiURL = `/topics`;

  async findAll(): Promise<Topic[]> {
    const response = await axiosInstance.get<Topic[]>(this.apiURL);
    return response.data;
  }

  async save(topic: Topic): Promise<Topic> {
    const response = await axiosInstance.post<Topic>(this.apiURL, topic);
    return response.data;
  }
}
