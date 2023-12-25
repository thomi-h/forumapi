const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchrestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    await deleteCommentUseCase.execute(useCasePayload);

    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.id,
      useCasePayload.owner,
    );
    expect(mockCommentRepository.verifyCommentInThread).toBeCalledWith(
      useCasePayload.id,
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.id,
    );
  });
});
