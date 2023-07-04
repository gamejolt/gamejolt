<script lang="ts">
import {
	computed,
	inject,
	InjectionKey,
	onUnmounted,
	PropType,
	provide,
	Ref,
	ref,
	shallowReadonly,
	toRefs,
	watch,
} from 'vue';
import { useRoute } from 'vue-router';
import type { DeregisterOnConnected } from '../../../app/components/grid/client.service';
import { useGridStore } from '../../../app/components/grid/grid-store';
import { illNoComments } from '../../../app/img/ill/illustrations';
import AppAlertBox from '../../alert/AppAlertBox.vue';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { Collaborator } from '../../collaborator/collaborator.model';
import { Environment } from '../../environment/environment.service';
import { formatNumber } from '../../filters/number';
import AppIllustration from '../../illustration/AppIllustration.vue';
import { FormCommentLazy } from '../../lazy';
import AppLoading from '../../loading/AppLoading.vue';
import AppMessageThread from '../../message-thread/AppMessageThread.vue';
import AppMessageThreadAdd from '../../message-thread/AppMessageThreadAdd.vue';
import { storeModel } from '../../model/model-store.service';
import { Model } from '../../model/model.service';
import AppNavTabList from '../../nav/tab-list/tab-list.vue';
import { useCommonStore } from '../../store/common-store';
import AppTranslate from '../../translate/AppTranslate.vue';
import { User } from '../../user/user.model';
import {
	canCommentOnModel,
	Comment,
	CommentableModel,
	getCommentModelResourceName,
} from '../comment-model';
import {
	commentStoreFetch,
	commentStoreFetchThread,
	commentStoreHandleAdd,
	commentStoreHandleEdit,
	commentStoreHandleRemove,
	CommentStoreManagerKey,
	CommentStoreModel,
	commentStorePin,
	commentStoreSort,
	lockCommentStore,
	releaseCommentStore,
} from '../comment-store';
import {
	CommentStoreSliceView,
	CommentStoreThreadView,
	CommentStoreView,
} from '../comment-store-view';
import { DisplayMode } from '../modal/modal.service';
import AppCommentWidgetComment from './AppCommentWidgetComment.vue';

let incrementer = 0;

export type CommentWidgetController = ReturnType<typeof createCommentWidget>;

const Key: InjectionKey<CommentWidgetController> = Symbol('comment-widget');

export function createCommentWidget(options: {
	model: Ref<Model & CommentableModel>;
	threadCommentId: Ref<number | null>;
	showTabs: Ref<boolean>;
	initialTab: Ref<string | null>;
	onError: (e: any) => void;
	onAdd: (comment: Comment) => void;
	onEdit: (comment: Comment) => void;
	onRemove: (comment: Comment) => void;
}) {
	const { model, threadCommentId, showTabs, initialTab } = options;

	const store = ref<CommentStoreModel | null>(null);
	const storeView = ref<CommentStoreView | null>(null);
	const id = ref(++incrementer);
	const hasBootstrapped = ref(false);
	const hasError = ref(false);
	const isLoading = ref(false);
	const resourceOwner = ref<User | null>(null);
	const perPage = ref(10);
	const currentPage = ref(1);
	const collaborators = ref<Collaborator[]>([]);

	const route = useRoute();
	const commentManager = inject(CommentStoreManagerKey)!;

	const loginUrl = computed(
		() => Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(route.fullPath)
	);

	const shouldShowLoadMore = computed(() => {
		return (
			!isLoading.value &&
			!isThreadView.value &&
			totalParentCount.value > currentParentCount.value
		);
	});

	const comments = computed(() => {
		if (storeView.value && store.value) {
			return storeView.value.getParents(store.value);
		}
		return [];
	});

	const childComments = computed(() => store.value?.childComments ?? {});
	const totalCommentsCount = computed(() => store.value?.totalCount ?? 0);
	const totalParentCount = computed(() => store.value?.parentCount ?? 0);
	const currentParentCount = computed(() => comments.value.length);
	const currentSort = computed(() => store.value?.sort ?? Comment.SORT_HOT);
	const isSortHot = computed(() => currentSort.value === Comment.SORT_HOT);
	const isSortTop = computed(() => currentSort.value === Comment.SORT_TOP);
	const isSortNew = computed(() => currentSort.value === Comment.SORT_NEW);
	const isSortYou = computed(() => currentSort.value === Comment.SORT_YOU);
	const showTopSorting = computed(() => getCommentModelResourceName(model.value) === 'Game');
	const isThreadView = computed(() => !!threadCommentId.value);
	const shouldShowEmptyMessage = computed(() => !comments.value.length);
	const canComment = computed(() => canCommentOnModel(model.value));

	const shouldShowTabs = computed(() => {
		if (!showTabs.value) {
			return false;
		}

		return totalCommentsCount.value > 0;
	});

	// TODO(realtime-reactions) this imports things from app section.
	//
	// need to check this doesnt screw things up:
	// - make sure the build goes through
	// - check ssr renders properly

	const { grid, whenGridConnected } = useGridStore();

	let _deregisterReactions: DeregisterOnConnected | null = null;

	async function _init() {
		if (!model.value) {
			return;
		}

		hasBootstrapped.value = false;
		hasError.value = false;

		if (store.value) {
			_releaseStore();
		}

		_lockStore();

		if (isThreadView.value && threadCommentId.value) {
			storeView.value = new CommentStoreThreadView(threadCommentId.value);
		} else {
			storeView.value = new CommentStoreSliceView();
		}

		// Filter comments based on the 'initialTab' prop. This allows us to set the comment
		// sorting to the "You" tab when you leave a comment from an event item.
		if (store.value && initialTab.value) {
			commentStoreSort(store.value, initialTab.value);
		}

		await _fetchComments();
	}

	function _lockStore() {
		const resource = getCommentModelResourceName(model.value);
		const resourceId = model.value.id;
		store.value = lockCommentStore(commentManager, resource, resourceId);

		if (_deregisterReactions) {
			console.error('Expected to not have a reaction handler yet');
		} else {
			_deregisterReactions = whenGridConnected(_joinReactionsChannel);
		}

		// Keep track of how many comment widgets have a lock on this store. We
		// need this data when closing the last widget to do some tear down
		// work.
		const metadata = store.value.metadata;
		if (!metadata.widgetLocks) {
			metadata.widgetLocks = 0;
		}
		metadata.widgetLocks += 1;
	}

	function _releaseStore() {
		if (!store.value) {
			return;
		}

		const metadata = store.value.metadata;
		metadata.widgetLocks -= 1;

		// If we are releasing the comment widget for this comment store, we
		// want to set the state back to how it was when we loaded up the first
		// comment widget. This way if you open up a new comment widget in the
		// future, we'll correctly start at the "hot" sort.
		if (metadata.widgetLocks === 0) {
			commentStoreSort(store.value, Comment.SORT_HOT);
		}

		releaseCommentStore(commentManager, store.value);
		_leaveReactionsChannel();

		store.value = null;
	}

	async function _fetchComments() {
		if (!store.value) {
			throw new Error(`You need a store set before fetching comments.`);
		}

		try {
			isLoading.value = true;

			let payload: any;
			if (isThreadView.value && threadCommentId.value) {
				payload = await commentStoreFetchThread(store.value, threadCommentId.value);

				// It's possible that the thread comment is actually a child. In
				// that case, update the view's parent ID to the returned parent
				// ID.
				if (storeView.value instanceof CommentStoreThreadView) {
					storeView.value.parentCommentId = storeModel(Comment, payload.parent).id;
				}
			} else {
				payload = await commentStoreFetch(store.value, currentPage.value);
			}

			isLoading.value = false;
			hasBootstrapped.value = true;
			hasError.value = false;
			resourceOwner.value = new User(payload.resourceOwner);
			perPage.value = payload.perPage || 10;

			// Display all loaded comments.
			if (storeView.value instanceof CommentStoreSliceView) {
				const ids = (payload.comments as any[]).map(o => o.id as number);
				storeView.value.registerIds(ids);
			}

			collaborators.value = payload.collaborators
				? Collaborator.populate(payload.collaborators)
				: [];
		} catch (e) {
			console.error(e);
			hasError.value = true;
			options.onError(e);
		}
	}

	function _joinReactionsChannel(): void {
		const resource = getCommentModelResourceName(model.value);
		const resourceId = model.value.id;
		const commentId = threadCommentId.value ? threadCommentId.value : 0;
		console.log(`joining reactions channel for ${commentId} on ${resource}/${resourceId}...`);

		grid.value?.startListeningToCommentsReactions({
			resource: resource,
			resource_id: resourceId,
			parent_comment_id: commentId,
		});
	}

	function _leaveReactionsChannel(): void {
		const resource = getCommentModelResourceName(model.value);
		const resourceId = model.value.id;
		const commentId = threadCommentId.value ? threadCommentId.value : 0;
		console.log(`leaving reactions channel for ${commentId} on ${resource}/${resourceId}...`);

		grid.value?.stopListeningToCommentsReactions({
			resource: resource,
			resource_id: resourceId,
			parent_comment_id: commentId,
		});

		if (_deregisterReactions) {
			_deregisterReactions();
			_deregisterReactions = null;
		}
	}

	function setSort(sort: string) {
		if (!store.value) {
			return;
		}

		currentPage.value = 1;
		commentStoreSort(store.value, sort);
		_fetchComments();
	}

	function loadMore() {
		currentPage.value++;
		_fetchComments();
	}

	function onCommentAdd(comment: Comment) {
		commentStoreHandleAdd(commentManager, comment);
		options.onAdd(comment);

		if (store.value) {
			if (store.value.sort !== Comment.SORT_YOU) {
				setSort(Comment.SORT_YOU);
			} else {
				if (storeView.value instanceof CommentStoreSliceView) {
					storeView.value.registerIds([comment.id]);
				}
			}
		}
	}

	function onCommentEdit(comment: Comment) {
		commentStoreHandleEdit(commentManager, comment);
		options.onEdit(comment);
	}

	function onCommentRemove(comment: Comment) {
		commentStoreHandleRemove(commentManager, comment);
		options.onRemove(comment);
	}

	function pinComment(comment: Comment) {
		return commentStorePin(commentManager, comment);
	}

	// Reinitialize anytime model changes.
	watch(
		() => model.value,
		() => _init()
	);

	onUnmounted(() => {
		if (store.value) {
			_releaseStore();
		}
	});

	_init();

	return shallowReadonly({
		threadCommentId,

		store,
		storeView,
		id,
		hasBootstrapped,
		hasError,
		isLoading,
		perPage,
		currentPage,
		collaborators,
		loginUrl,
		shouldShowLoadMore,
		comments,
		childComments,
		totalCommentsCount,
		totalParentCount,
		currentParentCount,
		currentSort,
		isSortHot,
		isSortTop,
		isSortNew,
		isSortYou,
		showTopSorting,
		isThreadView,
		canComment,
		shouldShowEmptyMessage,
		shouldShowTabs,
		resourceOwner,

		setSort,
		loadMore,
		onCommentAdd,
		onCommentEdit,
		onCommentRemove,
		pinComment,
	});
}

export function useCommentWidget() {
	return inject(Key, null);
}
</script>

<script lang="ts" setup>
const props = defineProps({
	model: {
		type: Object as PropType<Model & CommentableModel>,
		required: true,
	},
	autofocus: {
		type: Boolean,
	},
	threadCommentId: {
		type: Number,
		default: null,
	},
	showAdd: {
		type: Boolean,
		default: true,
	},
	showTabs: {
		type: Boolean,
		default: true,
	},
	initialTab: {
		type: String,
		default: null,
	},
	displayMode: {
		type: String as PropType<DisplayMode>,
		default: null,
	},
});

const emit = defineEmits({
	error: (_e: any) => true,
	add: (_comment: Comment) => true,
	edit: (_comment: Comment) => true,
	remove: (_comment: Comment) => true,
});

const c = createCommentWidget({
	...toRefs(props),
	onError: e => emit('error', e),
	onAdd: comment => emit('add', comment),
	onEdit: comment => emit('edit', comment),
	onRemove: comment => emit('remove', comment),
});
provide(Key, c);

const { user } = useCommonStore();
const {
	setSort,
	totalCommentsCount,
	hasBootstrapped,
	hasError,
	canComment,
	loginUrl,
	shouldShowTabs,
	showTopSorting,
	isSortHot,
	isSortTop,
	isSortYou,
	isSortNew,
	comments,
	childComments,
	isThreadView,
	shouldShowLoadMore,
	isLoading,
	shouldShowEmptyMessage,
	loadMore,
	onCommentAdd,
} = c;

function sortHot() {
	setSort(Comment.SORT_HOT);
}

function sortTop() {
	setSort(Comment.SORT_TOP);
}

function sortNew() {
	setSort(Comment.SORT_NEW);
}

function sortYou() {
	setSort(Comment.SORT_YOU);
}
</script>

<template>
	<div class="comment-widget">
		<div v-if="displayMode">
			<h4 v-if="displayMode" class="sans-margin-top">
				<AppTranslate
					v-if="displayMode === 'comments'"
					:translate-n="totalCommentsCount"
					:translate-params="{ count: formatNumber(totalCommentsCount) }"
					translate-plural="%{ count } comments"
				>
					1 comment
				</AppTranslate>
				<AppTranslate
					v-else
					:translate-n="totalCommentsCount"
					:translate-params="{ count: formatNumber(totalCommentsCount) }"
					translate-plural="%{ count } shouts"
				>
					1 shout
				</AppTranslate>
			</h4>
		</div>

		<AppLoading v-if="!hasBootstrapped && !hasError" centered />
		<div v-else-if="hasError" class="alert alert-notice">
			<AppTranslate>Couldn't fetch comments.</AppTranslate>
		</div>
		<div v-else-if="hasBootstrapped">
			<template v-if="showAdd">
				<AppMessageThreadAdd v-if="user" hide-message-split>
					<FormCommentLazy :model="model" :autofocus="autofocus" @submit="onCommentAdd" />
				</AppMessageThreadAdd>
				<AppAlertBox v-else icon="notice">
					You must be
					<a v-app-auth-required :href="loginUrl">logged in</a>
					to Game Jolt to post a comment.
				</AppAlertBox>
			</template>

			<div v-if="shouldShowTabs">
				<AppNavTabList>
					<ul>
						<li>
							<a
								v-app-track-event="`comment-widget:change-sort:hot`"
								:class="{ active: isSortHot }"
								@click="sortHot()"
							>
								<AppTranslate>Hot</AppTranslate>
							</a>
						</li>
						<li v-if="showTopSorting">
							<a
								v-app-track-event="`comment-widget:change-sort:top`"
								:class="{ active: isSortTop }"
								@click="sortTop()"
							>
								<AppTranslate>Top</AppTranslate>
							</a>
						</li>
						<li>
							<a
								v-app-track-event="`comment-widget:change-sort:new`"
								:class="{ active: isSortNew }"
								@click="sortNew()"
							>
								<AppTranslate>New</AppTranslate>
							</a>
						</li>
						<li>
							<a
								v-app-track-event="`comment-widget:change-sort:you`"
								:class="{ active: isSortYou }"
								@click="sortYou()"
							>
								<AppTranslate>You</AppTranslate>
							</a>
						</li>
					</ul>
				</AppNavTabList>
			</div>

			<AppMessageThread>
				<AppCommentWidgetComment
					v-for="comment of comments"
					:key="comment.id"
					:model="model"
					:comment="comment"
					:children="childComments[comment.id]"
					:show-children="isThreadView"
				/>
			</AppMessageThread>

			<div v-if="shouldShowLoadMore" class="page-cut">
				<AppButton v-app-track-event="`comment-widget:more`" trans @click="loadMore">
					<AppTranslate>Load More</AppTranslate>
				</AppButton>
			</div>

			<AppLoading v-if="isLoading" class="loading-centered" />
			<div v-else-if="shouldShowEmptyMessage">
				<AppIllustration :asset="illNoComments">
					<p>
						<AppTranslate v-if="showAdd && canComment">
							Everyone else seems to be in sleep mode, why don't you start the
							conversation?
						</AppTranslate>
						<AppTranslate v-else>Everyone seems to be in sleep mode.</AppTranslate>
					</p>
				</AppIllustration>
			</div>
		</div>
	</div>
</template>
