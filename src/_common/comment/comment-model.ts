import { trackCommentVote } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { ContentDocument } from '../content/content-document';
import { Environment } from '../environment/environment.service';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { showErrorGrowl } from '../growls/growls.service';
import {
	ModelStoreModel,
	RemovableModel,
	removeModel,
	saveModel,
	storeModel,
} from '../model/model-store.service';
import { Model } from '../model/model.service';
import { ReactionableModel, ReactionCount } from '../reaction/reaction-count';
import { $createSubscription, Subscription } from '../subscription/subscription.model';
import { User } from '../user/user.model';
import { CommentVote, CommentVoteType } from './vote/vote-model';

export interface CommentableModel {
	canViewComments: boolean;
	canMakeComment: boolean;
	canInteractWithComments: boolean;
}

export const enum CommentStatus {
	Removed = 0,
	Visible = 1,
	Spam = 2,
}

export const enum CommentSort {
	Hot = 'hot',
	Top = 'top',
	New = 'new',
	You = 'you',
}

export class Comment implements ModelStoreModel, RemovableModel, ReactionableModel {
	declare id: number;
	declare parent_id?: number;
	declare resource: 'Game' | 'Fireside_Post' | 'User';
	declare resource_id: number;
	declare user: User;
	declare votes: number;
	declare user_vote?: CommentVote;
	declare status: CommentStatus;
	declare posted_on: number;
	declare modified_on?: number;
	declare lang: string;
	declare subscription?: Subscription;
	declare is_pinned: boolean;
	declare comment_content: string;
	declare has_owner_like: boolean;
	declare has_owner_reply: boolean;

	reaction_counts: ReactionCount[] = [];
	reaction_counts_queue: Map<number, number> = new Map();
	supporters: User[] = [];

	isFollowPending = false;
	_removed = false;

	constructor(data: any) {
		this.update(data);
	}

	update(data: any): void {
		Object.assign(this, data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.user_vote) {
			this.user_vote = new CommentVote(data.user_vote);
		}

		if (data.subscription) {
			this.subscription = new Subscription(data.subscription);
		}

		if (data.reaction_counts) {
			this.reaction_counts = ReactionCount.populate(data.reaction_counts);
			this.reaction_counts_queue = new Map();
		}
	}

	get resourceName() {
		return 'Comment';
	}

	get permalink() {
		return Environment.baseUrl + '/x/permalink/comment/' + this.id;
	}
}

export async function fetchComment(id: number) {
	try {
		const payload = await Api.sendRequest(`/comments/get-comment/${id}`, null, {
			detach: true,
		});
		return storeModel(Comment, payload.comment);
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

/**
 * A helper for figuring out if the user can comment on the
 * {@link CommentableModel} passed in. Will also check any parent comment passed
 * in to make sure they have the correct permissions on that comment as well.
 */
export function canCommentOnModel(model: CommentableModel, parentComment?: Comment) {
	if (parentComment?.user.hasAnyBlock) {
		return false;
	}

	return model.canMakeComment;
}

export async function fetchComments(
	resource: string,
	resourceId: number,
	sort: CommentSort,
	options: {
		/** is a timestamp that controls where fetching starts (posted_on) */
		scrollId?: number | null;
		page?: number | null;
	}
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

export async function saveComment(data: Partial<Comment>) {
	const { model } = await saveModel(Comment, {
		url: !data.id ? `/comments/save` : `/comments/save/${data.id}`,
		field: 'comment',
		data,
		requestOptions: {
			detach: true,
		},
	});

	return model;
}

export async function removeComment(comment: Comment) {
	if (!comment.id) {
		throw new Error('Tried removing a comment that does not exist');
	}

	return removeModel(comment, `/comments/remove/${comment.id}`, {
		detach: true,
	});
}

export async function followComment(comment: Comment) {
	if (comment.subscription || comment.isFollowPending) {
		return;
	}
	comment.isFollowPending = true;

	const subscription = await $createSubscription(comment.id);
	comment.subscription = subscription;
	comment.isFollowPending = false;
}

export async function unfollowComment(comment: Comment) {
	if (!comment.subscription || comment.isFollowPending) {
		return;
	}
	comment.isFollowPending = true;

	await comment.subscription.$remove();
	comment.subscription = undefined;
	comment.isFollowPending = false;
}

/**
 * Applies pin operation to current comment and returns the comment that got
 * unpinned (or null if that didn't happen).
 */
export async function pinComment(comment: Comment) {
	const { response } = await saveModel(Comment, {
		url: `/comments/pin/${comment.id}`,
		field: 'comment',
	});

	return response['otherComment'] ? storeModel(Comment, response['otherComment']) : null;
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
	if (vote === CommentVoteType.Upvote) {
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
		return null;
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
	if (previousVote.vote === CommentVoteType.Upvote) {
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
		return null;
	} finally {
		trackCommentVote(previousVote.vote, { failed, toggled: true });
	}
}
