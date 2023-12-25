class GetThreadDetailUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    let comments = await this._commentRepository.getCommentsByThreadId(
      threadId,
    );

    comments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted
        ? '**komentar telah dihapus**'
        : comment.content,
    }));

    const response = {
      ...thread,
      comments,
    };

    return response;
  }
}

module.exports = GetThreadDetailUseCase;
