import type { Topic } from "../entities/Topic";

// Inversión de Dependencias (D): Definimos el contrato que la infraestructura debe cumplir
export interface TopicRepository {
  save(topic: Topic): Promise<Topic>;
  findAll(): Promise<Topic[]>;
}
