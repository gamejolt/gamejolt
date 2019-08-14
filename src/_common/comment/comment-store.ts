import Vue from 'vue';
import { Action, Mutation, namespace, State } from 'vuex-class';
import { arrayGroupBy, arrayRemove, numberSort } from '../../utils/array';
import { VuexAction, VuexGetter, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Api } from '../api/api.service';
import { Growls } from '../growls/growls.service';
import { Translate } from '../translate/translate.service';
import { Comment, fetchComments } from './comment-model';

export const CommentStoreNamespace = 'comment';
export const CommentState = namespace(CommentStoreNamespace, State);
export const CommentAction = namespace(CommentStoreNamespace, Action);
export const CommentMutation = namespace(CommentStoreNamespace, Mutation);

export type CommentActions = {
	'comment/lockCommentStore': { resource: string; resourceId: number };
	'comment/fetchComments': { store: CommentStoreModel; page?: number };
	'comment/pinComment': { comment: Comment };
	'comment/setSort': { store: CommentStoreModel; sort: string };
	'comment/fetchThread': { store: CommentStoreModel; parentId: number };
};

export type CommentMutations = {
	'comment/releaseCommentStore': CommentStoreModel;
	'comment/setCommentCount': { store: CommentStoreModel; count: number };
	'comment/setParentCommentCount': { store: CommentStoreModel; count: number };
	'comment/updateComment': { store: CommentStoreModel; commentId: number; data: any };
	'comment/onCommentAdd': Comment;
	'comment/onCommentEdit': Comment;
	'comment/onCommentRemove': Comment;
};

export class CommentStoreModel {
	count = 0;
	parentCount = 0;
	comments: Comment[] = [];
	locks = 0;
	sort = Comment.SORT_HOT;
	// This flag gets set for every change (add/remove/update), that prompts the overview component owner to update the commment info
	overviewNeedsRefresh = false;

	constructor(public resource: string, public resourceId: number) {}

	get parentComments() {
		const comments = this.comments.filter(i => !i.parent_id);

		return comments;
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
		if (removedComments) {
			this.count -= removedComments.length;
		}
	}

	clear() {
		this.comments = [];
		this.count = 0;
		this.parentCount = 0;
		this.locks = 0;
	}

	afterModification() {
		this.overviewNeedsRefresh = true;
	}
}

@VuexModule()
export class CommentStore extends VuexStore<CommentStore, CommentActions, CommentMutations> {
	stores: { [k: string]: CommentStoreModel } = {};

	@VuexGetter
	getCommentStore(resource: string, resourceId: number): CommentStoreModel | undefined {
		const storeId = resource + '/' + resourceId;
		return this.stores[storeId];
	}

	@VuexAction
	async lockCommentStore(payload: CommentActions['comment/lockCommentStore']) {
		const { resource, resourceId } = payload;
		const storeId = resource + '/' + resourceId;
		this._ensureCommentStore(payload);
		return this.stores[storeId];
	}

	@VuexAction
	async fetchThread(payload: CommentActions['comment/fetchThread']) {
		const { store, parentId } = payload;
		const response = await Api.sendRequest(`/comments/get-thread/${parentId}`, null, {
			noErrorRedirect: true,
		});

		const parent = new Comment(response.parent);
		const children = Comment.populate(response.children);

		const comments = children;
		comments.push(parent);

		this._addComments({ store, comments });

		return response;
	}

	@VuexAction
	async fetchComments(payload: CommentActions['comment/fetchComments']) {
		const { store, page } = payload;
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
		const comments = Comment.populate(response.comments).concat(
			Comment.populate(response.childComments)
		);

		this.setCommentCount({ store, count });
		this.setParentCommentCount({ store, count: parentCount });
		this._addComments({ store, comments });

		return response;
	}

	@VuexAction
	async pinComment(payload: CommentActions['comment/pinComment']) {
		const { comment } = payload;
		await comment.$pin();
		const store = this.getCommentStore(comment.resource, comment.resource_id);
		if (store instanceof CommentStoreModel) {
			store.afterModification();
		}
	}

	@VuexAction
	async setSort(payload: CommentActions['comment/setSort']) {
		const { store, sort } = payload;
		store.sort = sort;
		// clear the store's comments and prepare for reload
		store.clear();
	}

	@VuexMutation
	private _addComments(payload: { store: CommentStoreModel; comments: Comment[] }) {
		const { store, comments } = payload;
		for (const comment of comments) {
			// Replace an old instance of the comment in the store if it exists.
			const index = store.comments.findIndex(c => c.id === comment.id);
			if (index !== -1) {
				Vue.set(store.comments, index, comment);
			} else {
				store.comments.push(comment);
			}
		}
	}

	@VuexMutation
	private setParentCommentCount(payload: CommentMutations['comment/setParentCommentCount']) {
		const { store, count } = payload;
		store.parentCount = count;
	}

	@VuexMutation
	setCommentCount(payload: CommentMutations['comment/setCommentCount']) {
		const { store, count } = payload;
		store.count = count;
	}

	@VuexMutation
	updateComment(payload: CommentMutations['comment/updateComment']) {
		const { store, commentId, data } = payload;

		const comment = store.comments.find(i => i.id === commentId);
		if (comment) {
			comment.assign(data);
		}
	}

	@VuexMutation
	onCommentAdd(comment: CommentMutations['comment/onCommentAdd']) {
		const store = this.getCommentStore(comment.resource, comment.resource_id);
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				Translate.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				Translate.$gettext('Almost there...')
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

	@VuexMutation
	onCommentEdit(comment: CommentMutations['comment/onCommentEdit']) {
		// Was it marked as possible spam?
		if (comment.status === Comment.STATUS_SPAM) {
			Growls.success(
				Translate.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				Translate.$gettext('Almost there...')
			);
		}
		const store = this.getCommentStore(comment.resource, comment.resource_id);
		if (store instanceof CommentStoreModel) {
			store.afterModification();
		}
	}

	@VuexMutation
	onCommentRemove(comment: CommentMutations['comment/onCommentRemove']) {
		const store = this.getCommentStore(comment.resource, comment.resource_id);
		if (store) {
			if (!comment.parent_id) {
				--store.parentCount;
				// reduce comment count by amount of child comments on this parent + 1 for the parent
				const childAmount = store.comments.filter(c => c.parent_id === comment.id).length;
				store.count -= childAmount + 1;
			} else {
				--store.count;
			}
			arrayRemove(store.comments, i => i.id === comment.id);
			store.afterModification();
		}
	}

	@VuexMutation
	private _ensureCommentStore(payload: { resource: string; resourceId: number }) {
		const { resource, resourceId } = payload;
		const storeId = resource + '/' + resourceId;

		if (!this.stores[storeId]) {
			Vue.set(this.stores, storeId, new CommentStoreModel(resource, resourceId));
		}

		++this.stores[storeId].locks;
	}

	@VuexMutation
	releaseCommentStore(store: CommentMutations['comment/releaseCommentStore']) {
		const storeId = store.resource + '/' + store.resourceId;
		if (!this.stores[storeId]) {
			console.warn(
				`Tried releasing a comment store that doesn't exist: ${storeId} - most likely it was released twice`
			);
			return;
		}

		--this.stores[storeId].locks;
		if (this.stores[storeId].locks <= 0) {
			Vue.delete(this.stores, storeId);
		}
	}
}
