const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};

    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: 'abc',
      owner: 'user',
    };

    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw error when title contains more than 50 character', () => {
    const payload = {
      title:
        'veeeerrrrryyyyyyllllllllooooooooonnnnnnnnnnnggggggggggggtttttttiiitttttleeeeeeeeeeeeee',
      body: 'abc',
      owner: 'user',
    };

    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.TITLE_LIMIT_CHAR',
    );
  });

  it('should create NewThread object correctly', () => {
    const payload = {
      title: 'title',
      body: 'body',
      owner: 'user-123',
    };

    const { title, body, owner } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
