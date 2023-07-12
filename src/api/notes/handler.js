const ClientError = require('../../exceptions/ClientError');

module.exports = class NoteHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    try {
      this.validator.validateNotePayload(request.payload);
      const { title = 'untitled', body, tags } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const noteId = await this.service.addNote({
        title, body, tags, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Note successfully added',
        data: {
          noteId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getNotesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const notes = await this.service.getNotes(credentialId);
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyNoteOwner(id, credentialId);
      const note = await this.service.getNoteById(id);
      return {
        status: 'success',
        data: {
          note,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putNoteByIdHandler(request, h) {
    try {
      this.validator.validateNotePayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyNoteOwner(id, credentialId);
      await this.service.editNoteById(id, request.payload);
      const response = h.response({
        status: 'success',
        message: 'Note successfully updated',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyNoteOwner(id, credentialId);
      await this.service.deleteNoteById(id);
      const response = h.response({
        status: 'success',
        message: 'Note successfully deleted',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
};
