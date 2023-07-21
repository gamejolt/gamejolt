import { Model, defineLegacyModel } from '../../model/model.service';

export const enum CommentVoteType {
	Upvote = 1,
	Downvote = 0,
}

export class CommentVote extends defineLegacyModel(
	class CommentVoteDefinition extends Model {
		declare comment_id: number;
		declare user_id: number;
		declare posted_on: number;
		declare vote: CommentVoteType;

		$save() {
			return this.$_save(
				'/comments/votes/add/' + this.comment_id + '/' + this.vote,
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

		$remove() {
			return this.$_remove('/comments/votes/remove/' + this.comment_id, {
				detach: true,
				ignorePayloadUser: true,
				data: {
					timestamp: Date.now(),
				},
			});
		}
	}
) {}
