<script lang="ts" setup>
import { computed, inject, onUnmounted, PropType, ref, toRefs } from 'vue';
import {
	Analytics,
	PostControlsLocation,
	trackPostPublish,
} from '../../../../_common/analytics/analytics.service';
import AppAnimElectricity from '../../../../_common/animation/AppAnimElectricity.vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import AppFiresidePostLikeWidget from '../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerControlsOverlay from '../../../../_common/sticker/AppStickerControlsOverlay.vue';
import { useStickerLayer } from '../../../../_common/sticker/layer/layer-controller';
import { setStickerDrawerOpen, useStickerStore } from '../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { UserFollowSuggestion } from '../../../../_common/user/follow/suggestion.service';
import { User } from '../../../../_common/user/user.model';
import { ActivityFeedItem } from '../../activity/feed/item-service';
import { ActivityFeedView } from '../../activity/feed/view';
import { PostEditModal } from '../edit-modal/edit-modal-service';
import AppPostControlsStats from './AppPostControlsStats.vue';
import AppPostControlsMore from './more/more.vue';
import AppPostControlsSaveProgress from './save-progress/save-progress.vue';
import AppPostControlsUserFollow from './user-follow/user-follow.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	feed: {
		type: Object as PropType<ActivityFeedView>,
		default: undefined,
	},
	item: {
		type: Object as PropType<ActivityFeedItem>,
		default: undefined,
	},
	location: {
		type: String as PropType<PostControlsLocation>,
		required: true,
	},
	shouldShowFollow: {
		type: Boolean,
	},
	showComments: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	eventLabel: {
		type: String,
		default: '',
	},
});

const { post, feed, item, location, shouldShowFollow, showComments, overlay, eventLabel } =
	toRefs(props);

const emit = defineEmits({
	postEdit: () => true,
	postPublish: () => true,
	postRemove: () => true,
	postFeature: (_community: Community) => true,
	postUnfeature: (_community: Community) => true,
	postMoveChannel: (_movedTo: CommunityChannel) => true,
	postReject: (_community: Community) => true,
	postPin: () => true,
	postUnpin: () => true,
	sticker: () => true,
});

const commentManager = inject(CommentStoreManagerKey)!;
const stickerLayer = useStickerLayer();

const { user } = useCommonStore();
const stickerStore = useStickerStore();

const { canChargeSticker } = stickerStore;

// The 'feed' and 'item' props will be included when this is used in the
// activity feed. If that's the case, we need to make sure we synchronize with
// the activity feed item state so that if they click away from the feed and
// back to it, it can initialize with the previous state.
const shouldShowFollowState = ref(
	item?.value && feed?.value ? feed.value.isItemShowingFollow(item.value) : false
);

const commentStore = ref<CommentStoreModel | null>(
	lockCommentStore(commentManager, 'Fireside_Post', post.value.id)
);
setCommentCount(commentStore.value!, post.value.comment_count);

const isShowingFollow = computed(() => {
	if (!shouldShowFollow.value || !shouldShowFollowState.value || !post.value) {
		return false;
	}

	if ((user.value && user.value.id === post.value.user.id) || post.value.user.is_following) {
		return false;
	}

	return true;
});

const commentsCount = computed(() => (commentStore.value ? commentStore.value.totalCount : 0));

const canPublish = computed(
	() =>
		post.value.isDraft &&
		!post.value.isScheduled &&
		post.value.hasLead &&
		post.value.canPublishToCommunities()
);

const showUserControls = computed(() => post.value.isActive && !post.value.is_processing);

const hasPerms = computed(() => {
	if (!user.value) {
		return false;
	}
	return post.value.isEditableByUser(user.value);
});

const shouldShowEdit = computed(() => hasPerms.value);

const shouldShowExtra = computed(() => user.value instanceof User);

const shouldShowCommentsButton = computed(() => showComments.value);

const shouldShowStickersButton = computed(() => post.value.canPlaceSticker);

const shouldShowLike = computed(() => post.value.canLike);

onUnmounted(() => {
	if (commentStore.value) {
		releaseCommentStore(commentManager, commentStore.value);
		commentStore.value = null;
	}
});

function openComments() {
	Analytics.trackEvent('post-controls', 'comments', eventLabel.value);
	CommentModal.show({
		model: post.value,
		displayMode: 'comments',
	});
}

async function openEdit() {
	Analytics.trackEvent('post-controls', 'edit', eventLabel.value);
	if (await PostEditModal.show(post.value)) {
		emit('postEdit');
	}
}

async function publish() {
	trackPostPublish();
	await post.value.$publish();
	emit('postPublish');
}

async function placeSticker() {
	Analytics.trackEvent('post-controls', 'sticker-place', eventLabel.value);
	setStickerDrawerOpen(stickerStore, true, stickerLayer);
	emit('sticker');
}

function setUserFollow(showing: boolean) {
	if (showing && post.value) {
		// Do nothing if a post is liked and we recently suggested
		// to follow that user - so we don't spam them.
		if (!UserFollowSuggestion.canSuggest(post.value.user.id)) {
			return;
		}

		// Track analytics for how many people see user-follow,
		// and stop suggesting to follow the user for 'X' amount
		// of time - specified in UserFollowSuggestion.
		Analytics.trackEvent('user-follow', 'show', 'fireside-post-like-widget');
		UserFollowSuggestion.doNotSuggest(post.value.user.id);
	}

	shouldShowFollowState.value = showing;

	// If we're part of the activity feed, synchronize it with that state as well.
	if (item?.value && feed?.value) {
		feed.value.setItemShowingFollow(item.value, showing);
	}
}

function onUserFollowDismissal() {
	// Track analytics for how often people click
	// on the 'X' button to hide user-follow.
	Analytics.trackEvent('user-follow', 'hide', 'fireside-post-like-widget');
	setUserFollow(false);
}
</script>

<template>
	<div>
		<AppTheme :force-dark="overlay">
			<AppStickerControlsOverlay end :hide="overlay">
				<div class="post-controls">
					<div class="-row">
						<div v-if="showUserControls" class="-row">
							<AppFiresidePostLikeWidget
								v-if="shouldShowLike"
								:post="post"
								:location="location"
								:overlay="overlay"
								trans
								@change="setUserFollow"
							/>

							<div
								v-if="shouldShowCommentsButton"
								class="-inline-button"
								:class="{ '-overlay-text': overlay }"
							>
								<AppButton
									v-app-tooltip="$gettext('View Comments')"
									icon="comment-filled"
									circle
									trans
									@click="openComments()"
								/>

								<a
									v-if="commentsCount > 0"
									class="blip"
									:class="{ mobile: Screen.isXs }"
									@click="openComments()"
								>
									{{ formatFuzzynumber(commentsCount) }}
								</a>
								<span v-else class="blip-missing" />
							</div>

							<template v-if="shouldShowStickersButton">
								<AppAnimElectricity
									shock-anim="square"
									:disabled="
										!canChargeSticker || !stickerLayer?.isAllCreator.value
									"
									ignore-asset-padding
								>
									<AppButton
										v-app-tooltip="$gettext('Place Sticker')"
										v-app-auth-required
										:class="{ '-overlay-text': overlay }"
										icon="sticker-filled"
										circle
										trans
										@click="placeSticker()"
									/>
								</AppAnimElectricity>
							</template>
						</div>
						<div v-else-if="post.is_processing" class="-row fill-offset -processing">
							<AppPostControlsSaveProgress :post="post" />
						</div>
						<span v-if="shouldShowExtra" class="-extra">
							<span v-if="shouldShowEdit && !showUserControls" class="-extra">
								<AppButton
									v-if="canPublish"
									class="-inline-button"
									:overlay="overlay"
									primary
									@click="publish()"
								>
									<AppTranslate>Publish</AppTranslate>
								</AppButton>
								<AppButton
									class="-inline-button"
									:overlay="overlay"
									@click="openEdit()"
								>
									<AppTranslate>Edit</AppTranslate>
								</AppButton>

								<span class="-spacing-right" />
							</span>

							<AppPostControlsMore
								:post="post"
								:overlay="overlay"
								@remove="emit('postRemove')"
								@feature="emit('postFeature', $event)"
								@unfeature="emit('postUnfeature', $event)"
								@move-channel="emit('postMoveChannel', $event)"
								@reject="emit('postReject', $event)"
								@pin="emit('postPin')"
								@unpin="emit('postUnpin')"
							/>
						</span>
					</div>

					<div
						class="-row small"
						:class="{ '-spacing-top': shouldShowEdit, tiny: Screen.isXs }"
					>
						<AppPostControlsStats
							:key="'stats'"
							:class="{ 'text-muted': !overlay }"
							:overlay="overlay"
							:post="post"
						/>

						<span v-if="shouldShowEdit && showUserControls" class="-extra">
							<AppButton
								v-if="canPublish"
								class="-inline-button"
								:overlay="overlay"
								primary
								@click="publish()"
							>
								<AppTranslate>Publish</AppTranslate>
							</AppButton>
							<AppButton
								class="-inline-button"
								:overlay="overlay"
								@click="openEdit()"
							>
								<AppTranslate>Edit</AppTranslate>
							</AppButton>
						</span>
					</div>
				</div>
			</AppStickerControlsOverlay>
		</AppTheme>

		<AppPostControlsUserFollow
			:class="{ '-overlay-box': overlay }"
			:post="post"
			:should-show="isShowingFollow"
			@close="onUserFollowDismissal"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.post-controls
	display: flex
	flex-direction: column
	flex-grow: 1

	.-row
		display: flex
		align-items: center

	.-processing
		padding: 8px
		rounded-corners()

	.-inline-button
		display: inline-flex
		align-items: center

	.-extra
		margin-left: auto
		flex-shrink: 0

		.-inline-button
			margin-left: 12px

	.-spacing-top
		margin-top: 12px

	.-spacing-right
		margin-right: 8px

.-overlay-text
	::v-deep(*)
		color: white
		text-shadow: black 1px 1px 4px

.-overlay-box
	elevate-1()
</style>
