const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add comment and return added comment correctly', async () => {
      const newComment = new NewComment({
        content: 'comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
      );

      const databaseComment = await CommentTableTestHelper.getCommentById(
        'comment-123',
      );

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'comment',
          owner: 'user-123',
        }),
      );
      expect(databaseComment).toHaveLength(1);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return true for the right owner', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const response = await commentRepositoryPostgres.verifyCommentOwner(
        'comment-123',
        'user-123',
      );

      expect(response).toEqual(true);
      expect(response).toBeTruthy();
    });
  });

  it('should return AuthorizationError for the wrong owner', async () => {
    await CommentTableTestHelper.addComment({
      id: 'comment-123',
      content: 'comment',
      owner: 'user-123',
    });

    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    await expect(
      commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-321'),
    ).rejects.toThrowError(AuthorizationError);
  });

  describe('verifyCommentInThread function', () => {
    it('should return true when comment is in thread', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const response = await commentRepositoryPostgres.verifyCommentInThread(
        'comment-123',
        'thread-123',
      );

      expect(response).toEqual(true);
      expect(response).toBeTruthy();
    });

    it('should throw not found error when comment is not in thread', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.verifyCommentInThread(
          'comment-123',
          'thread-321',
        ),
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return all comments in thread', async () => {
      const firstComment = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'comment',
        date: new Date('2023-02-19T00:00:00.000Z'),
        is_deleted: false,
        username: 'dicoding',
      };

      const secondComment = {
        id: 'comment-321',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'comment',
        date: new Date('2023-01-19T00:00:00.000Z'),
        is_deleted: true,
        username: 'dicoding',
      };

      await CommentTableTestHelper.addComment(firstComment);
      await CommentTableTestHelper.addComment(secondComment);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-123',
      );

      expect(comments).toEqual([
        {
          id: 'comment-321',
          content: 'comment',
          date: new Date('2023-01-19T00:00:00.000Z'),
          username: 'dicoding',
          is_deleted: true,
        },
        {
          id: 'comment-123',
          content: 'comment',
          date: new Date('2023-02-19T00:00:00.000Z'),
          username: 'dicoding',
          is_deleted: false,
        },
      ]);
    });

    it('should return empty array when no comment in thread', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      expect(
        await commentRepositoryPostgres.getCommentsByThreadId('thread-123'),
      ).toEqual([]);
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment is not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.deleteComment('comment-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should delete comment correctly', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment('comment-123');

      const comment = await CommentTableTestHelper.getCommentById(
        'comment-123',
      );

      expect(comment[0].is_deleted).toEqual(true);
    });
  });
});
