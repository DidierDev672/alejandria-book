export type TopicType = "research" | "tech_stack" | "literature" | "philosophy";

export interface Topic {
  id?: string;
  name: string;
  type: TopicType;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TopicFactory {
  // Principio de Responsabilidad Unica (S): Centraliza la inicializacion limpia del objeto
  static createEmpty(): Topic {
    return {
      name: "",
      type: "research",
      description: "",
    };
  }
}
