import Vue from 'vue';
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { Collaborator } from '../../collaborator/collaborator.model';
import { Environment } from '../../environment/environment.service';
import { number } from '../../filters/number';
import AppIllustration from '../../illustration/illustration.vue';
import AppLoading from '../../loading/loading.vue';
import AppMessageThreadAdd from '../../message-thread/add/add.vue';
import AppMessageThreadContent from '../../message-thread/content/content.vue';
import AppMessageThread from '../../message-thread/message-thread.vue';
import { Model } from '../../model/model.service';
import AppNavTabList from '../../nav/tab-list/tab-list.vue';
import { AppState, AppStore } from '../../store/app-store';
import { User } from '../../user/user.model';
import FormComment from '../add/add.vue';
import { canCommentOnModel, Comment, getCommentModelResourceName } from '../comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	fetchCommentThread,
	fetchStoreComments,
	lockCommentStore,
	onCommentAdd,
	onCommentEdit,
	onCommentRemove,
	pinComment,
	releaseCommentStore,
	setCommentSort,
} from '../comment-store';
import {
	CommentStoreSliceView,
	CommentStoreThreadView,
	CommentStoreView,
} from '../comment-store-view';
import { DisplayMode } from '../modal/modal.service';
import AppCommentWidgetComment from './comment/comment.vue';

let incrementer = 0;

@Component({
	components: {
		AppLoading,
		AppNavTabList,
		AppMessageThread,
		AppMessageThreadAdd,
		AppMessageThreadContent,
		AppCommentWidgetComment,
		AppIllustration,
		FormComment,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppCommentWidget extends Vue {
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	@Prop(Model)
	model!: Model;

	@Prop(Boolean)
	onlyAdd?: boolean;

	@Prop(Boolean)
	autofocus?: boolean;

	@Prop(Number)
	threadCommentId?: number;

	@Prop({ type: Boolean, default: true })
	showAdd!: boolean;

	@Prop({ type: Boolean, default: true })
	showTabs!: boolean;

	@Prop(propOptional(String))
	initialTab?: string;

	@Prop(propOptional(String, null))
	displayMode!: DisplayMode | null;

	@AppState
	user!: AppStore['user'];

	store: CommentStoreModel | null = null;
	storeView: CommentStoreView | null = null;
	id = ++incrementer;
	hasBootstrapped = false;
	hasError = false;
	isLoading = false;
	resourceOwner: User | null = null;
	perPage = 10;
	currentPage = 1;

	collaborators: Collaborator[] = [];

	readonly number = number;

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get shouldShowLoadMore() {
		return (
			!this.isLoading && !this.isThreadView && this.totalParentCount > this.currentParentCount
		);
	}

	get comments() {
		if (this.storeView && this.store) {
			return this.storeView.getParents(this.store);
		}
		return [];
	}

	get childComments() {
		return this.store ? this.store.childComments : [];
	}

	get totalCommentsCount() {
		return this.store ? this.store.totalCount : 0;
	}

	get totalParentCount() {
		return this.store ? this.store.parentCount : 0;
	}

	get currentParentCount() {
		return this.comments.length;
	}

	get currentSort() {
		return this.store ? this.store.sort : Comment.SORT_HOT;
	}

	get isSortHot() {
		return this.currentSort === Comment.SORT_HOT;
	}

	get isSortTop() {
		return this.currentSort === Comment.SORT_TOP;
	}

	get isSortNew() {
		return this.currentSort === Comment.SORT_NEW;
	}

	get isSortYou() {
		return this.currentSort === Comment.SORT_YOU;
	}

	get showTopSorting() {
		return getCommentModelResourceName(this.model) === 'Game';
	}

	get isThreadView() {
		return !!this.threadCommentId;
	}

	get shouldShowAdd() {
		if (!canCommentOnModel(this.model)) {
			return false;
		}
		return this.showAdd;
	}

	get shouldShowEmptyMessage() {
		return !this.comments.length;
	}

	get shouldShowTabs() {
		if (!this.showTabs) {
			return false;
		}

		return this.totalCommentsCount > 0;
	}

	async created() {
		await this.init();
	}

	destroyed() {
		if (this.store) {
			this._releaseStore();
		}
	}

	@Watch('model')
	async init() {
		if (!this.model) {
			return;
		}

		this.hasBootstrapped = false;
		this.hasError = false;

		if (this.store) {
			this._releaseStore();
		}

		this._lockStore();

		if (this.isThreadView && this.threadCommentId) {
			this.storeView = new CommentStoreThreadView(this.threadCommentId);
		} else {
			this.storeView = new CommentStoreSliceView();
		}

		// Filter comments based on the 'initialTab' prop. This allows us to set the comment
		// sorting to the "You" tab when you leave a comment from an event item.
		if (this.store && this.initialTab) {
			setCommentSort(this.store, this.initialTab);
		}

		await this._fetchComments();
	}

	private _lockStore() {
		const resource = getCommentModelResourceName(this.model);
		const resourceId = this.model.id;
		this.store = lockCommentStore(this.commentManager, resource, resourceId);

		// Keep track of how many comment widgets have a lock on this store. We
		// need this data when closing the last widget to do some tear down
		// work.
		const metadata = this.store.metadata;
		if (!metadata.widgetLocks) {
			metadata.widgetLocks = 0;
		}
		metadata.widgetLocks += 1;
	}

	private _releaseStore() {
		if (!this.store) {
			return;
		}

		const metadata = this.store.metadata;
		metadata.widgetLocks -= 1;

		// If we are releasing the comment widget for this comment store, we
		// want to set the state back to how it was when we loaded up the first
		// comment widget. This way if you open up a new comment widget in the
		// future, we'll correctly start at the "hot" sort.
		if (metadata.widgetLocks === 0) {
			setCommentSort(this.store, Comment.SORT_HOT);
		}

		releaseCommentStore(this.commentManager, this.store);
		this.store = null;
	}

	private async _fetchComments() {
		if (!this.store) {
			throw new Error(`You need a store set before fetching comments.`);
		}

		try {
			this.isLoading = true;

			let payload: any;
			if (this.isThreadView && this.threadCommentId) {
				payload = await fetchCommentThread(this.store, this.threadCommentId);
				// It's possible that the thread comment is actually a child. In that case, update the view's parent id to the returned parent id
				if (this.storeView instanceof CommentStoreThreadView) {
					this.storeView.parentCommentId = new Comment(payload.parent).id;
				}
			} else {
				payload = await fetchStoreComments(this.store, this.currentPage);
			}

			this.isLoading = false;
			this.hasBootstrapped = true;
			this.hasError = false;
			this.resourceOwner = new User(payload.resourceOwner);
			this.perPage = payload.perPage || 10;

			// Display all loaded comments.
			if (this.storeView instanceof CommentStoreSliceView) {
				const ids = (payload.comments as any[]).map(o => o.id as number);
				this.storeView.registerIds(ids);
			}

			this.collaborators = payload.collaborators
				? Collaborator.populate(payload.collaborators)
				: [];
		} catch (e) {
			console.error(e);
			this.hasError = true;
			this.$emit('error', e);
		}
	}

	_onCommentAdd(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'add');
		onCommentAdd(this.commentManager, comment);
		this.$emit('add', comment);
		if (this.store) {
			if (this.store.sort !== Comment.SORT_YOU) {
				this._setSort(Comment.SORT_YOU);
			} else {
				if (this.storeView instanceof CommentStoreSliceView) {
					this.storeView.registerIds([comment.id]);
				}
			}
		}
	}

	_onCommentEdit(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'edit');
		onCommentEdit(this.commentManager, comment);
		this.$emit('edit', comment);
	}

	_onCommentRemove(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'remove');
		onCommentRemove(this.commentManager, comment);
		this.$emit('remove', comment);
	}

	_pinComment(comment: Comment) {
		pinComment(this.commentManager, comment);
	}

	sortHot() {
		this._setSort(Comment.SORT_HOT);
	}

	sortTop() {
		this._setSort(Comment.SORT_TOP);
	}

	sortNew() {
		this._setSort(Comment.SORT_NEW);
	}

	sortYou() {
		this._setSort(Comment.SORT_YOU);
	}

	private _setSort(sort: string) {
		if (!this.store) {
			return;
		}

		this.currentPage = 1;
		setCommentSort(this.store, sort);
		this._fetchComments();
	}

	loadMore() {
		this.currentPage++;
		this._fetchComments();
	}
}
