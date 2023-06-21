const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
  constructor() {
    this.notes = [];
  }

  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      id,
      title,
      body,
      tags,
      createdAt,
      updatedAt,
    };

    this.notes.push(newNote);

    const isSuccess = this.notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Failed to add note.');
    }

    return id;
  }

  getNotes() {
    return this.notes;
  }

  getNoteById(id) {
    const note = this.notes.filter((n) => n.id === id)[0];
    if (!note) {
      throw new NotFoundError('Note not found');
    }
    return note;
  }

  editNoteById(id, { title, body, tags }) {
    const index = this.notes.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new NotFoundError('Failed to update note. Note not found');
    }

    const updatedAt = new Date().toISOString();

    this.notes[index] = {
      ...this.notes[index],
      title,
      body,
      tags,
      updatedAt,
    };
  }

  deleteNoteById(id) {
    const index = this.notes.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new NotFoundError('Failed to delete note. Note not found');
    }

    this.notes.splice(index, 1);
  }
}

module.exports = NotesService;
