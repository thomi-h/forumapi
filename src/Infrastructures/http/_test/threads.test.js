const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 if not authenticated', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 if payload not contain needed property', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secretpassword',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...loginPayload,
          fullname: 'dicoding',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 if payload not meet data type specification', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secretpassword',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...loginPayload,
          fullname: 'dicoding',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: true,
          body: 'judul',
        },
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });

    it('should response 201 and create new thread', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secretpassword',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...loginPayload,
          fullname: 'dicoding',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'thread title',
          body: 'thread body',
        },
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.title).toEqual('thread title');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not available', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secretpassword',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...loginPayload,
          fullname: 'dicoding',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxxx',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 and return thread detail', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secretpassword',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...loginPayload,
          fullname: 'dicoding',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'thread title',
          body: 'thread body',
        },
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadResponse.data.addedThread.id}`,
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(
        threadResponse.data.addedThread.id,
      );
      expect(responseJson.data.thread.title).toEqual('thread title');
      expect(responseJson.data.thread.body).toEqual('thread body');
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
    });
  });
});
