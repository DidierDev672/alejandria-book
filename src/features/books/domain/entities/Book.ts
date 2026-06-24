export interface Book {
  ID?: string;
  title: string;
  description: string;
  author: string;
  genres: string[];
  photos: string[];
  publicationDate: string; // ISO string o YYYY-MM-DD
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookFactory {
  // Centraliza la creacion limpia (S de SOLID)
  static createEmpty(): Book {
    return {
      title: "",
      description: "",
      author: "",
      genres: [],
      photos: [],
      publicationDate: "",
    };
  }
}
