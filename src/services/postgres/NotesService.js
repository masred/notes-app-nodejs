const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
  constructor() {
    this.pool = new Pool();
  }

  async addNote({
    title, body, tags, owner,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add note');
    }

    return result.rows[0].id;
  }

  async getNotes(owner) {
    const result = await this.pool.query({
      text: 'SELECT * FROM notes WHERE owner = $1',
      values: [owner],
    });
    return result.rows.map(mapDBToModel);
  }

  async getNoteById(id) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('Note not found');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, new Date().toISOString(), id],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0]) {
      throw new InvariantError('Note not found');
    }
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('Note not found');
    }
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = NotesService;
