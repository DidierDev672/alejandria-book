import type { Book } from "../entities/Book";

// Definicion del contrato abstracto (DIP - Inversion de Dependencias)
export interface BookRepository {
  save(book: Book): Promise<Book>;
  findAll(): Promise<Book[]>;
  update(id: string, book: Partial<Book>): Promise<Book>;
}
