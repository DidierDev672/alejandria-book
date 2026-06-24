import axiosInstance from "@/infrastructure/http/axiosInstance";
import type { BookRepository } from "../../domain/repositories/BookRepository";
import type { Book } from "../../domain/entities/Book";

export class AxiosBookRepository implements BookRepository {
  private readonly apiURL = `/books`;

  async findAll(): Promise<Book[]> {
    const response = await axiosInstance.get<Book[]>(this.apiURL);
    if (typeof response.data === "string") {
      return JSON.parse(response.data) as Book[];
    }

    return response.data as Book[];
  }

  async save(book: Book): Promise<Book> {
    const response = await axiosInstance.post<Book>(this.apiURL, book);

    // Control robusto en caso de que el backend devuelve un String plano
    if (typeof response.data === "string") {
      return JSON.parse(response.data) as Book;
    }

    return response.data as Book;
  }

  async update(id: string, book: Partial<Book>): Promise<Book> {
    const response = await axiosInstance.put<Book>(`${this.apiURL}/${id}`, book);

    if (typeof response.data === "string") {
      return JSON.parse(response.data) as Book;
    }

    return response.data as Book;
  }
}
