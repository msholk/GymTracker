import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Note } from '../types'; // Import Note type

const Notes: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<string>('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState<string>('');
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchNotes = async () => {
            const notesCol = collection(db, 'notes');
            const q = await getDocs(notesCol);
            const userNotes = q.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Note))
                .filter(note => note.uid === user.uid);
            setNotes(userNotes);
        };
        fetchNotes();
    }, [user]);

    const addNote = async () => {
        if (newNote.trim() && user) {
            const now = new Date();
            const noteData = {
                title: 'Untitled',
                content: newNote,
                createdAt: now,
                updatedAt: now,
                uid: user.uid
            };
            const docRef = await addDoc(collection(db, 'notes'), noteData);
            setNotes([...notes, { id: docRef.id, ...noteData }]);
            setNewNote('');
        }
    };

    const updateNote = async (id: string) => {
        if (editingNoteContent.trim()) {
            const noteRef = doc(db, 'notes', id);
            await updateDoc(noteRef, { content: editingNoteContent });
            setNotes(notes.map(note => (note.id === id ? { ...note, content: editingNoteContent } : note)));
            setEditingNoteId(null);
            setEditingNoteContent('');
        }
    };

    const deleteNote = async (id: string) => {
        const noteRef = doc(db, 'notes', id);
        await deleteDoc(noteRef);
        setNotes(notes.filter(note => note.id !== id));
    };

    return (
        <div>
            <h2>Notes</h2>
            <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note"
            />
            <button onClick={addNote}>Add Note</button>
            <ul>
                {notes.map(note => (
                    <li key={note.id}>
                        {editingNoteId === note.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editingNoteContent}
                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                />
                                <button onClick={() => updateNote(note.id)}>Update</button>
                            </>
                        ) : (
                            <>
                                <span>{note.content}</span>
                                <button onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteContent(note.content);
                                }}>Edit</button>
                                <button onClick={() => deleteNote(note.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notes;