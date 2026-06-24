export type NoteType = 'summary' | 'quote' | 'idea' | 'analysis' | 'note';

export interface Note {
    id?: string;
    name: string;
    content: string;
    type: NoteType;
    color: string;
    idTopics: string;
    idBook: string;
    createdAt?: Date;
    updatedAt?: Date;
}

//  Factory para asegurar la creacion valida y valores por defecto (S de SOLID)
export class NoteFactory {
    static createEmpty(): Note {
        return {
            name: '',
            content: '',
            type: 'summary',
            color: '#f4f1ea', // Tono crema inspirado en páginas de libros (Behance)
            idTopics: '',
            idBook: '',
        };
    }
}

