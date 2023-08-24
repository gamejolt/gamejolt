import { InjectionKey } from 'vue';
import { arrayGroupBy, arrayRemove, numberSort } from '../../utils/array';
import { Api } from '../api/api.service';
import { showSuccessGrowl } from '../growls/growls.service';
import { storeModel, storeModelList } from '../model/model-store.service';
import { $gettext } from '../translate/translate.service';
import { Comment, fetchComments, pinComment } from './comment-model';

export const CommentStoreManagerKey: InjectionKey<CommentStoreManager> = Symbol('comment-store');

export class CommentStoreModel {
	totalCount = 0;
	count = 0;
	parentCount = 0;
	comments: Comment[] = [];
	locks = 0;
	sort = Comment.SORT_HOT;
	// This flag gets set for every change (add/remove/update), that prompts the
	// overview component owner to update the comment info
	overviewNeedsRefresh = false;

	/**
	 * Components that get a lock on this comment store can use this metadata to
	 * store information for their own purposes. The store itself doesn't use
	 * it.
	 * */
	metadata: any = {};

	constructor(public resource: string, public resourceId: number) {}

	get parentComments() {
		return this.comments.filter(i => !i.parent_id);
	}

	get childComments() {
		// child comments always get sorted by time
		const comments = this.comments
			.filter(i => i.parent_id)
			.sort((a, b) => numberSort(a.posted_on, b.posted_on));

		return arrayGroupBy(comments, 'parent_id');
	}

	contains(comment: Comment) {
		return this.comments.findIndex(i => i.id === comment.id) !== -1;
	}

	// removes a comment from the store, does not delete the comment itself
	remove(id: number) {
		const removedComments = arrayRemove(this.comments, c => c.id === id);
		this.count -= removedComments.length;
	}

	clear() {
		this.comments = [];
		this.count = 0;
		this.parentCount = 0;
	}

	afterModification() {
		this.overviewNeedsRefresh = true;
	}
}

/** Keeper of The Comment Stores (CommentStoreModel) */
export class CommentStoreManager {
	stores: { [k: string]: CommentStoreModel } = {};
}

export function getCommentStore(
	manager: CommentStoreManager,
	resource: string,
	resourceId: number
): CommentStoreModel | undefined {
	const storeId = resource + '/' + resourceId;
	return manager.stores[storeId];
}

export function lockCommentStore(
	manager: CommentStoreManager,
	resource: string,
	resourceId: number
) {
	const storeId = resource + '/' + resourceId;

	if (!manager.stores[storeId]) {
		manager.stores[storeId] = new CommentStoreModel(resource, resourceId);
	}

	++manager.stores[storeId].locks;
	return manager.stores[storeId];
}

export function releaseCommentStore(manager: CommentStoreManager, store: CommentStoreModel) {
	const storeId = store.resource + '/' + store.resourceId;
	if (!manager.stores[storeId]) {
		console.warn(
			`Tried releasing a comment store that doesn't exist: ${storeId} - most likely it was released twice`
		);
		return;
	}

	--store.locks;
	if (store.locks <= 0) {
		delete manager.stores[storeId];
	}
}

export async function commentStoreFetchThread(store: CommentStoreModel, parentId: number) {
	const response = await Api.sendRequest(`/comments/get-thread/${parentId}`, null, {
		noErrorRedirect: true,
	});

	const parent = storeModel(Comment, response.parent);
	const children = storeModelList(Comment, response.children);

	const comments = children;
	comments.push(parent);

	_addComments(store, comments);

	return response;
}

export async function commentStoreFetch(store: CommentStoreModel, page?: number) {
	let response: any;

	// 'new' and 'you' sort by last timestamp using scroll
	if (store.sort === Comment.SORT_NEW || store.sort === Comment.SORT_YOU) {
		// load comments after the last timestamp
		const lastComment =
			store.parentComments.length === 0
				? null // no comments loaded
				: store.parentComments[store.parentComments.length - 1];

		// only use the last comment's timestamp if it's not pinned (pinned comment's dates are sorted differently)
		const lastTimestamp =
			lastComment !== null && !lastComment.is_pinned ? lastComment.posted_on : null;

		response = await fetchComments(store.resource, store.resourceId, store.sort, {
			scrollId: lastTimestamp,
		});
	} else {
		// 'hot' and 'top' paginate
		response = await fetchComments(store.resource, store.resourceId, store.sort, {
			page: page || 1,
		});
	}

	const count = response.count || 0;
	const parentCount = response.parentCount || 0;
	const comments = storeModelList(Comment, response.comments).concat(
		storeModelList(Comment, response.childComments)
	);

	commentStoreCount(store, count);
	_setParentCommentCount(store, parentCount);
	_addComments(store, comments);

	return response;
}

export async function commentStorePin(manager: CommentStoreManager, comment: Comment) {
	await pinComment(comment);

	const store = getCommentStore(manager, comment.resource, comment.resource_id);
	if (store instanceof CommentStoreModel) {
		store.afterModification();
	}
}

export function commentStoreSort(store: CommentStoreModel, sort: string) {
	store.sort = sort;
	// clear the store's comments and prepare for reload
	store.clear();
}

function _addComments(store: CommentStoreModel, comments: Comment[]) {
	for (const comment of comments) {
		// Replace an old instance of the comment in the store if it exists.
		const index = store.comments.findIndex(c => c.id === comment.id);
		if (index !== -1) {
			store.comments[index] = comment;
		} else {
			store.comments.push(comment);
		}
	}
}

function _setParentCommentCount(store: CommentStoreModel, count: number) {
	store.parentCount = count;
}

export function commentStoreCount(store: CommentStoreModel, count: number) {
	store.count = count;

	if (count) {
		store.totalCount = count;
	}
}

export function commentStoreUpdate(store: CommentStoreModel, commentId: number, data: any) {
	const comment = store.comments.find(i => i.id === commentId);
	if (comment) {
		comment.update(data);
	}
}

export function commentStoreHandleAdd(manager: CommentStoreManager, comment: Comment) {
	const store = getCommentStore(manager, comment.resource, comment.resource_id);

	if (comment.status === Comment.STATUS_SPAM) {
		showSuccessGrowl(
			$gettext(
				`Your comment has been marked for review. Please allow some time for it to show on the site.`
			),
			$gettext(`Almost there...`)
		);
	} else if (store && !store.contains(comment)) {
		// insert the new comment at the beginning
		if (store.sort === Comment.SORT_YOU || comment.parent_id) {
			++store.count;
			store.comments.unshift(comment);
			if (!comment.parent_id) {
				++store.parentCount;
			}
		}
		store.afterModification();
	}
}

export function commentStoreHandleEdit(manager: CommentStoreManager, comment: Comment) {
	// Was it marked as possible spam?
	if (comment.status === Comment.STATUS_SPAM) {
		showSuccessGrowl(
			$gettext(
				`Your comment has been marked for review. Please allow some time for it to show on the site.`
			),
			$gettext(`Almost there...`)
		);
	}
	const store = getCommentStore(manager, comment.resource, comment.resource_id);
	if (store instanceof CommentStoreModel) {
		store.afterModification();
	}
}

export function commentStoreHandleRemove(manager: CommentStoreManager, comment: Comment) {
	const store = getCommentStore(manager, comment.resource, comment.resource_id);
	if (!store) {
		return;
	}

	if (!comment.parent_id) {
		--store.parentCount;
		// reduce comment count by amount of child comments on this parent + 1 for the parent
		const childAmount = store.comments.filter(c => c.parent_id === comment.id).length;
		store.count -= childAmount + 1;
		store.totalCount -= childAmount + 1;
	} else {
		--store.count;
		--store.totalCount;
	}
	arrayRemove(store.comments, i => i.id === comment.id);
	store.afterModification();
}
