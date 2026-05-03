import { Model } from '~common/model/model.service';

export const CommentVoteTypeUpvote = 1;
export const CommentVoteTypeDownvote = 0;

export type CommentVoteType = typeof CommentVoteTypeUpvote | typeof CommentVoteTypeDownvote;

export class CommentVoteModel extends Model {
	declare comment_id: number;
	declare user_id: number;
	declare posted_on: number;
	declare vote: CommentVoteType;
}

export function $saveCommentVote(model: CommentVoteModel) {
	return model.$_save(
		'/comments/votes/add/' + model.comment_id + '/' + model.vote,
		'commentVote',
		{
			detach: true,
			ignorePayloadUser: true,
			data: {
				timestamp: Date.now(),
			},
		}
	);
}

export function $removeCommentVote(model: CommentVoteModel) {
	return model.$_remove('/comments/votes/remove/' + model.comment_id, {
		detach: true,
		ignorePayloadUser: true,
		data: {
			timestamp: Date.now(),
		},
	});
}
