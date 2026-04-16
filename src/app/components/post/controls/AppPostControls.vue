<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue';

import {
	Analytics,
	PostControlsLocation,
	trackPostPublish,
} from '../../../../_common/analytics/analytics.service';
import AppAnimElectricity from '../../../../_common/animation/AppAnimElectricity.vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	commentStoreCount,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	useCommentStoreManager,
} from '../../../../_common/comment/comment-store';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import AppFiresidePostLikeWidget from '../../../../_common/fireside/post/like/widget/AppFiresidePostLikeWidget.vue';
import {
	$publishFiresidePost,
	FiresidePostModel,
} from '../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerControlsOverlay from '../../../../_common/sticker/AppStickerControlsOverlay.vue';
import { useStickerLayer } from '../../../../_common/sticker/layer/layer-controller';
import { openStickerDrawer, useStickerStore } from '../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserFollowSuggestion } from '../../../../_common/user/follow/suggestion.service';
import { UserModel } from '../../../../_common/user/user.model';
import { ActivityFeedItem } from '../../activity/feed/item-service';
import { ActivityFeedView } from '../../activity/feed/view';
import { showCommentModal } from '../../comment/modal/modal.service';
import { showPostEditModal } from '../edit-modal/edit-modal-service';
import AppPostControlsStats from './AppPostControlsStats.vue';
import AppPostControlsMore from './more/AppPostControlsMore.vue';
import AppPostControlsSaveProgress from './save-progress/AppPostControlsSaveProgress.vue';
import AppPostControlsUserFollow from './user-follow/AppPostControlsUserFollow.vue';

type Props = {
	post: FiresidePostModel;
	feed?: ActivityFeedView;
	item?: ActivityFeedItem;
	location: PostControlsLocation;
	shouldShowFollow?: boolean;
	showComments?: boolean;
	overlay?: boolean;
	eventLabel?: string;
};
const {
	post,
	feed,
	item,
	location,
	shouldShowFollow,
	showComments,
	overlay,
	eventLabel = '',
} = defineProps<Props>();

const emit = defineEmits<{
	postEdit: [];
	postPublish: [];
	postRemove: [];
	postFeature: [community: CommunityModel];
	postUnfeature: [community: CommunityModel];
	postMoveChannel: [movedTo: CommunityChannelModel];
	postReject: [community: CommunityModel];
	postPin: [];
	postUnpin: [];
	sticker: [];
}>();

const commentManager = useCommentStoreManager()!;
const stickerLayer = useStickerLayer();

const { user } = useCommonStore();
const stickerStore = useStickerStore();

const { canChargeSticker } = stickerStore;

// The 'feed' and 'item' props will be included when this is used in the
// activity feed. If that's the case, we need to make sure we synchronize with
// the activity feed item state so that if they click away from the feed and
// back to it, it can initialize with the previous state.
const shouldShowFollowState = ref(
	item && feed ? feed.isItemShowingFollow(item) : false
);

const commentStore = ref<CommentStoreModel | null>(
	lockCommentStore(commentManager, 'Fireside_Post', post.id)
);
commentStoreCount(commentStore.value!, post.comment_count);

const isShowingFollow = computed(() => {
	if (!shouldShowFollow || !shouldShowFollowState.value || !post) {
		return false;
	}

	if ((user.value && user.value.id === post.user.id) || post.user.is_following) {
		return false;
	}

	return true;
});

const commentsCount = computed(() => (commentStore.value ? commentStore.value.totalCount : 0));

const canPublish = computed(
	() =>
		post.isDraft &&
		!post.isScheduled &&
		post.hasLead &&
		post.canPublishToCommunities()
);

const showUserControls = computed(() => post.isActive && !post.is_processing);

const hasPerms = computed(() => {
	if (!user.value) {
		return false;
	}
	return post.isEditableByUser(user.value);
});

const shouldShowEdit = computed(() => hasPerms.value);
const shouldShowExtra = computed(() => user.value instanceof UserModel);
const shouldShowCommentsButton = computed(() => showComments);
const shouldShowStickersButton = computed(() => post.canPlaceSticker && !!stickerLayer);
const shouldShowLike = computed(() => post.canLike);

const commentsButtonTooltip = computed(() =>
	post.canViewComments ? $gettext(`View comments`) : $gettext(`Comments are disabled`)
);

onUnmounted(() => {
	if (commentStore.value) {
		releaseCommentStore(commentManager, commentStore.value);
		commentStore.value = null;
	}
});

function openComments() {
	Analytics.trackEvent('post-controls', 'comments', eventLabel);

	showCommentModal({
		model: post,
		displayMode: 'comments',
	});
}

async function openEdit() {
	Analytics.trackEvent('post-controls', 'edit', eventLabel);
	if (await showPostEditModal(post)) {
		emit('postEdit');
	}
}

async function publish() {
	trackPostPublish();
	await $publishFiresidePost(post);
	emit('postPublish');
}

async function placeSticker() {
	if (!stickerLayer) {
		return;
	}

	Analytics.trackEvent('post-controls', 'sticker-place', eventLabel);
	openStickerDrawer(stickerStore, stickerLayer);
	emit('sticker');
}

function setUserFollow(showing: boolean) {
	if (showing && post) {
		// Do nothing if a post is liked and we recently suggested
		// to follow that user - so we don't spam them.
		if (!UserFollowSuggestion.canSuggest(post.user.id)) {
			return;
		}

		// Track analytics for how many people see user-follow,
		// and stop suggesting to follow the user for 'X' amount
		// of time - specified in UserFollowSuggestion.
		Analytics.trackEvent('user-follow', 'show', 'fireside-post-like-widget');
		UserFollowSuggestion.doNotSuggest(post.user.id);
	}

	shouldShowFollowState.value = showing;

	// If we're part of the activity feed, synchronize it with that state as well.
	if (item && feed) {
		feed.setItemShowingFollow(item, showing);
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
									v-app-tooltip="commentsButtonTooltip"
									icon="comment-filled"
									circle
									trans
									:disabled="!post.can_view_comments"
									@click="openComments()"
								/>

								<a
									v-if="post.can_view_comments && commentsCount > 0"
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
										!canChargeSticker ||
										!stickerLayer ||
										!stickerLayer.canChargeAllTargets.value
									"
									ignore-asset-padding
								>
									<AppButton
										v-app-tooltip="$gettext('Place sticker')"
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
