import { LoadingModel } from "../domain/Loading.model";
import type { LoadingProps } from "../domain/Loading.types";

export class LoadingService {
  private model: LoadingModel;

  constructor(model?: LoadingModel) {
    this.model = model || new LoadingModel({});
  }

  prepareContent(props: LoadingProps): Record<string, string> {
    return {
      title: props.title
        ? this.model.truncate(
            props.title,
            this.model["config"]?.maxCharsTitle || 50,
          )
        : "Cargando...",
      description: props.description
        ? this.model.truncate(
            props.description,
            this.model["config"]?.maxCharsDescription || 150,
          )
        : this.model.getDefaultConfig(),
    };
  }
}
