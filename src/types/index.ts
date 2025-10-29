export interface User {
    uid: string;
    email: string | null;
    displayName?: string | null;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    uid: string;
}