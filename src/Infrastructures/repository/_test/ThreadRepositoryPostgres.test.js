const UserTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add new thread and return added thread correctly', async () => {
      await UserTableTestHelper.addUser({
        username: 'dicoding',
        password: 'supersecretpassword',
      });

      const newThread = new NewThread({
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedThread = await threadRepositoryPostgres.addNewThread(
        newThread,
      );

      const databaseThread = await ThreadTableTestHelper.findThreadById(
        'thread-123',
      );

      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'thread title',
          owner: 'user-123',
        }),
      );

      expect(databaseThread).toHaveLength(1);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.getThreadById('thread-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      await UserTableTestHelper.addUser({
        username: 'dicoding',
        password: 'supersecretpassword',
      });

      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'Thread',
        body: 'body',
        date: new Date('2023-01-19T00:00:00.000Z'),
        username: 'dicoding',
      });
    });

    describe('verifyAvailableThread function', () => {
      it('should throw NoutFoundError when thread is not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(
          threadRepositoryPostgres.verifyAvailableThread('thread-123'),
        ).rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when thread is available', async () => {
        await UserTableTestHelper.addUser({
          username: 'dicoding',
          password: 'supersecretpassword',
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await ThreadTableTestHelper.addThread({
          id: 'thread-123',
        });

        await expect(
          threadRepositoryPostgres.verifyAvailableThread('thread-123'),
        ).resolves.not.toThrowError(NotFoundError);
        await expect(
          threadRepositoryPostgres.verifyAvailableThread('thread-123'),
        ).resolves.toEqual(1);
      });
    });
  });
});
