import { Model } from '../../model/model.service';

export const enum CommentVoteType {
	Upvote = 1,
	Downvote = 0,
}

export class CommentVoteModel extends Model {
	declare comment_id: number;
	declare user_id: number;
	declare posted_on: number;
	declare vote: CommentVoteType;
}

export function $saveCommentVoteModel(model: CommentVoteModel) {
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

export function $removeCommentVoteModel(model: CommentVoteModel) {
	return model.$_remove('/comments/votes/remove/' + model.comment_id, {
		detach: true,
		ignorePayloadUser: true,
		data: {
			timestamp: Date.now(),
		},
	});
}
