export interface LoadingProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export interface LoadingConfig {
  animationDuration: number;
  maxCharsTitle: number;
  maxCharsDescription: number;
}

export const DEFAULT_CONFIG: LoadingConfig = {
  animationDuration: 2000,
  maxCharsTitle: 50,
  maxCharsDescription: 150,
};
