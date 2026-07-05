import { DEFAULT_CONFIG, type LoadingConfig } from "./Loading.types";

export class LoadingModel {
  private readonly config: LoadingConfig;

  constructor(config: Partial<LoadingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;

    return `${text.slice(0, maxLength)}...`;
  }

  getDefaultConfig(): string {
    return "Anejandría reúne sabiduría de todas las eras en un santuario digital donde cada conocimiento encuentra su lugar.";
  }
}
