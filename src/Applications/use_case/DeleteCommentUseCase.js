class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { id, threadId, owner } = useCasePayload;

    await this._commentRepository.verifyCommentInThread(id, threadId);
    await this._commentRepository.verifyCommentOwner(id, owner);
    await this._commentRepository.deleteComment(id);
  }
}

module.exports = DeleteCommentUseCase;
