import { trackCommentVote } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { ContentDocument } from '../content/content-document';
import { Environment } from '../environment/environment.service';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { showErrorGrowl } from '../growls/growls.service';
import { Model } from '../model/model.service';
import { constructStickerCounts, StickerCount } from '../sticker/sticker-count';
import { Subscription } from '../subscription/subscription.model';
import { User } from '../user/user.model';
import { CommentVote } from './vote/vote-model';

export class Comment extends Model {
	static readonly STATUS_REMOVED = 0;
	static readonly STATUS_VISIBLE = 1;
	static readonly STATUS_SPAM = 2;

	static readonly SORT_HOT = 'hot';
	static readonly SORT_TOP = 'top';
	static readonly SORT_NEW = 'new';
	static readonly SORT_YOU = 'you';

	parent_id!: number;
	resource!: 'Game' | 'Fireside_Post' | 'User';
	resource_id!: number;
	user!: User;
	votes!: number;
	user_vote?: CommentVote;
	status!: number;
	posted_on!: number;
	modified_on?: number;
	lang!: string;
	subscription?: Subscription;
	is_pinned!: boolean;
	comment_content!: string;
	sticker_counts: StickerCount[] = [];
	supporters: User[] = [];

	isFollowPending = false;

	get permalink() {
		return Environment.baseUrl + '/x/permalink/comment/' + this.id;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.user_vote) {
			this.user_vote = new CommentVote(data.user_vote);
		}

		if (data.subscription) {
			this.subscription = new Subscription(data.subscription);
		}

		if (data.sticker_counts) {
			this.sticker_counts = constructStickerCounts(data.sticker_counts);
		}

		if (data.supporters) {
			this.supporters = User.populate(data.supporters);
		}
	}

	$save() {
		if (!this.id) {
			return this.$_save(`/comments/save`, 'comment', {
				detach: true,
			});
		} else {
			return this.$_save(`/comments/save/${this.id}`, 'comment', {
				detach: true,
			});
		}
	}

	$remove() {
		if (!this.id) {
			throw new Error('Tried removing a comment that does not exist');
		} else {
			return this.$_remove(`/comments/remove/${this.id}`, {
				detach: true,
			});
		}
	}

	async $follow() {
		if (this.subscription || this.isFollowPending) {
			return;
		}
		this.isFollowPending = true;

		const subscription = await Subscription.$subscribe(this.id);
		this.subscription = subscription;
		this.isFollowPending = false;
	}

	async $removeFollow() {
		if (!this.subscription || this.isFollowPending) {
			return;
		}
		this.isFollowPending = true;

		await this.subscription.$remove();
		this.subscription = undefined;
		this.isFollowPending = false;
	}

	// applies pin operation to current comment and returns the comment that
	// got unpinned (or null if that didn't happen)
	async $pin(): Promise<Comment | null> {
		const result = await this.$_save(`/comments/pin/${this.id}`, 'comment');
		return result['otherComment'] ? new Comment(result['otherComment']) : null;
	}
}

Model.create(Comment);

export async function fetchComment(id: number) {
	try {
		const payload = await Api.sendRequest(`/comments/get-comment/${id}`, null, {
			detach: true,
		});
		return new Comment(payload.comment);
	} catch (e) {
		// Probably removed.
	}
}

export type CommentBlockReason = 'commenter-blocked' | 'mentioned-blocked-user';

export function getCommentBlockReason(comment: Comment): CommentBlockReason | false {
	if (comment.user.is_blocked) {
		return 'commenter-blocked';
	}

	const doc = ContentDocument.fromJson(comment.comment_content);
	const mentions = doc.getMarks('mention');

	for (const mention of mentions) {
		const hydrated = doc.hydration.find(
			i => i.source === mention.attrs.username && i.type === 'username'
		);

		if (hydrated?.data?.is_blocked) {
			return 'mentioned-blocked-user';
		}
	}

	return false;
}

export function getCommentModelResourceName(model: Model) {
	if (model instanceof Game) {
		return 'Game';
	} else if (model instanceof User) {
		return 'User';
	} else if (model instanceof FiresidePost) {
		return 'Fireside_Post';
	}
	throw new Error('Model cannot contain comments');
}

export function canCommentOnModel(model: Model, parentComment?: Comment) {
	if (parentComment && !parentComment.user.canComment) {
		return false;
	}

	if (model instanceof User) {
		return model.canComment;
	} else if (model instanceof FiresidePost) {
		return model.canComment;
	} else if (model instanceof Game) {
		return model.canComment;
	}

	return true;
}

/**
 * @param options scrollId is a timestamp that controls where fetching starts (posted_on)
 */
export async function fetchComments(
	resource: string,
	resourceId: number,
	sort: string,
	options: { scrollId?: number | null; page?: number | null }
) {
	const { scrollId, page } = options;
	let query = '';

	if (scrollId) {
		query = '?scroll_id=' + scrollId;
	}

	if (page) {
		query = '?page=' + page;
	}

	return Api.sendRequest(`/comments/${resource}/${resourceId}/${sort}${query}`, undefined, {
		detach: true,
	});
}

export async function getCommentUrl(commentId: number): Promise<string> {
	const response = await Api.sendRequest(`/comments/get-comment-url/${commentId}`, null, {
		detach: true,
	});

	if (!response || response.errors) {
		return Promise.reject(response.errors);
	}

	return response.url;
}

export async function addCommentVote(comment: Comment, vote: number) {
	// Don't do anything if they are setting the same vote.
	if (comment.user_vote && comment.user_vote.vote === vote) {
		return;
	}

	const newVote = new CommentVote({ comment_id: comment.id, vote });

	const previousVote = comment.user_vote;
	const hadPreviousVote = !!previousVote;
	comment.user_vote = newVote;

	// We only show upvotes. So we only want to change when it's upvoted, or we decrement 1 if
	// they had previously set it to upvote and are changing to downvote to signify the removal
	// of the upvote only.
	let operation = 0;
	if (vote === CommentVote.VOTE_UPVOTE) {
		operation = 1;
	} else if (hadPreviousVote) {
		// Their previous vote had to be an upvote in this case.
		operation = -1;
	}
	comment.votes += operation;

	let failed = false;
	try {
		return await newVote.$save();
	} catch (e) {
		failed = true;
		comment.votes -= operation;
		comment.user_vote = previousVote;
		showErrorGrowl(`Can't do that now. Try again later?`);
	} finally {
		trackCommentVote(vote, { failed, toggled: false });
	}
}

export async function removeCommentVote(comment: Comment) {
	if (!comment.user_vote) {
		return;
	}

	const previousVote = comment.user_vote;

	// Votes only show upvotes, so don't modify vote count if it was a downvote.
	if (previousVote.vote === CommentVote.VOTE_UPVOTE) {
		--comment.votes;
	}
	comment.user_vote = undefined;

	let failed = false;
	try {
		return await previousVote.$remove();
	} catch (e) {
		failed = true;
		comment.user_vote = previousVote;
		++comment.votes;
		showErrorGrowl(`Can't do that now. Try again later?`);
	} finally {
		trackCommentVote(previousVote.vote, { failed, toggled: true });
	}
}
