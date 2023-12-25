const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;

    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) returning id, content, owner',
      values: [id, threadId, owner, content, date],
    };

    const response = await this._pool.query(query);

    return new AddedComment(response.rows[0]);
  }

  async verifyCommentOwner(commentId, ownerId) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, ownerId],
    };

    const response = await this._pool.query(query);

    if (!response.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource');
    }

    return true;
  }

  async verifyCommentInThread(commentId, threadId) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const response = await this._pool.query(query);

    if (!response.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return true;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT comments.id, comments.content, comments.date, comments.is_deleted, users.username FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY comments.date ASC',
      values: [threadId],
    };

    const response = await this._pool.query(query);

    return response.rows;
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1',
      values: [commentId],
    };

    const response = await this._pool.query(query);

    if (!response.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
