const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

const GetThreadDetailUseCase = require('../../use_case/GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThreadDetail = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'dicoding',
    };

    const mockCommentInThread = [
      {
        id: 'comment-123',
        username: 'dicoding',
        content: 'comment',
        date: 'date',
        is_deleted: true,
      },
      {
        id: 'comment-321',
        username: 'indonesia',
        content: 'comment',
        date: 'date',
        is_deleted: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        date: 'date',
        username: 'dicoding',
      }),
    );
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'comment-123',
            username: 'dicoding',
            content: 'comment',
            date: 'date',
            is_deleted: true,
          },
          {
            id: 'comment-321',
            username: 'indonesia',
            content: 'comment',
            date: 'date',
            is_deleted: false,
          },
        ]),
      );

    const mockGetThreadDetailUseCase = new GetThreadDetailUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const thread = await mockGetThreadDetailUseCase.execute(
      useCasePayload.threadId,
    );

    expect(thread).toStrictEqual({
      ...mockThreadDetail,
      comments: mockCommentInThread.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_deleted
          ? '**komentar telah dihapus**'
          : comment.content,
      })),
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
  });
});
