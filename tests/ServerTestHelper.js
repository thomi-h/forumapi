/* istanbul ignore file */
const ServerTestHelper = {
  async getAccessTokenAndUserIdHelper({ server, username = 'dicoding' }) {
    const userPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const responseUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'Dicoding Indonesia',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const { id: userId } = JSON.parse(responseUser.payload).data.addedUser;
    const { accessToken } = JSON.parse(responseAuth.payload).data;
    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
