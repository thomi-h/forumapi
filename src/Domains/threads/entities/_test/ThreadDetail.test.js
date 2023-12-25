const ThreadDetail = require('../ThreadDetail');

describe('a ThreadDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
    };

    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: true,
      body: 'body',
      date: 'date',
      owner: 'user',
    };

    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ThreadDetail object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
      owner: 'user',
    };

    const threadDetail = new ThreadDetail(payload);

    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.owner).toEqual(payload.owner);
    expect(threadDetail.comments).toEqual(payload.comments);
  });
});
