<script lang="ts" setup>
import { computed, CSSProperties, PropType, ref, toRefs } from 'vue';
import { RouteLocationRaw, RouterLink, useRoute, useRouter } from 'vue-router';
import { CommunityUserNotificationModel } from '../../../../_common/community/user-notification/user-notification.model';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import { FiresidePostVideoModel } from '../../../../_common/fireside/post/video/video-model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { createLightbox } from '../../../../_common/lightbox/lightbox-helpers';
import { MediaItemModel } from '../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../_common/media-item/post/AppMediaItemPost.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { StickerTargetController } from '../../../../_common/sticker/target/target-controller';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserFollowButton from '../../../../_common/user/follow/AppUserFollowButton.vue';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleOverlayTextShadow, styleWhen } from '../../../../_styles/mixins';
import { arrayRemove } from '../../../../utils/array';
import AppCommunityUserNotification from '../../../components/community/user-notification/AppCommunityUserNotification.vue';
import AppGameBadge from '../../../components/game/badge/AppGameBadge.vue';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppPostContent from '../../../components/post/AppPostContent.vue';

const UserFollowLocation = 'postPage' as const;

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	stickerTargetController: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
	communityNotifications: {
		type: Array as PropType<CommunityUserNotificationModel[]>,
		default: () => [],
	},
});

const { post, communityNotifications } = toRefs(props);

const route = useRoute();
const router = useRouter();
const { user } = useCommonStore();

const videoStartTime = ref(0);

const lightbox = createLightbox(computed(() => post.value.media));

const displayUser = computed(() => post.value.displayUser);
const video = computed<FiresidePostVideoModel | null>(() => post.value.videos[0] || null);
const background = computed(() => post.value.background);
const shouldOverlay = computed(() => !!background.value);

if (typeof route.query.t === 'string') {
	if (video.value) {
		// DODO: Set the max val to the video end time.
		videoStartTime.value = Math.floor(Math.max(0, parseInt(route.query.t, 10))) * 1000;
	}

	// Get rid of the time from the URL so that it doesn't pollute
	// shared addresses.
	router.replace({
		...route,
		query: { ...route.query, t: undefined },
	} as RouteLocationRaw);
}

function onClickFullscreen(mediaItem: MediaItemModel) {
	const index = post.value.media.findIndex(i => i.id === mediaItem.id);
	lightbox.show(index !== -1 ? index : null);
}

function onDismissNotification(notification: CommunityUserNotificationModel) {
	arrayRemove(communityNotifications.value, i => i.id === notification.id);
}

const overlayText: CSSProperties = {
	...styleOverlayTextShadow,
	color: `white`,
};
</script>

<template>
	<component :is="background ? AppPageContainer : 'div'" xl>
		<template v-if="communityNotifications">
			<AppCommunityUserNotification
				v-for="communityNotification of communityNotifications"
				:key="communityNotification.id"
				:notification="communityNotification"
				@dismiss="onDismissNotification(communityNotification)"
			/>
		</template>

		<div class="post-view">
			<AppGameBadge v-if="post.game" class="_game-badge" :game="post.game" full-bleed />

			<div>
				<!-- User Info -->
				<div class="-user-info">
					<div class="-avatar">
						<AppUserCardHover :user="displayUser" :disabled="Screen.isXs">
							<AppUserAvatarBubble
								:user="displayUser"
								show-verified
								show-frame
								smoosh
								bg-color="bg-subtle"
							/>
						</AppUserCardHover>
					</div>

					<RouterLink :to="displayUser.url" class="_name link-unstyled">
						<span
							:style="{
								...styleWhen(shouldOverlay, overlayText),
							}"
						>
							<strong>{{ displayUser.display_name }}</strong>
						</span>
						<span
							class="tiny text-muted"
							:style="{
								...styleWhen(shouldOverlay, overlayText),
							}"
						>
							@{{ displayUser.username }}
						</span>
					</RouterLink>

					<div class="_controls">
						<AppUserFollowButton
							v-if="!user || displayUser.id !== user.id"
							:user="displayUser"
							hide-count
							:location="UserFollowLocation"
						/>
					</div>
				</div>
			</div>

			<slot name="sticker-scroll" />

			<div v-if="post.hasMedia" class="_media-items">
				<div v-for="item of post.media" :key="item.id">
					<AppMediaItemPost
						class="_media-item"
						:media-item="item"
						is-active
						can-place-sticker
						@fullscreen="onClickFullscreen"
					/>
					<br />
				</div>
			</div>

			<div class="tiny text-muted">
				<AppTimeAgo
					v-if="post.isActive"
					:style="{
						...styleWhen(shouldOverlay, overlayText),
					}"
					:date="post.published_on"
					strict
				/>
				<template v-else-if="post.isScheduled">
					<span class="tag" style="vertical-align: middle">
						<AppJolticon icon="calendar-grid" />
						{{ ' ' }}
						<AppTranslate>Scheduled</AppTranslate>
					</span>
					{{ ' ' }}
					<AppTimeAgo :date="post.scheduled_for" strict without-suffix />
				</template>
				<span v-else-if="post.isDraft" class="tag" style="vertical-align: middle">
					<AppTranslate>Draft</AppTranslate>
				</span>
			</div>

			<AppPostContent
				:post="post"
				:sticker-target-controller="stickerTargetController"
				wrapper-component="div"
				:wrapper-component-props="{}"
			/>
		</div>
	</component>
</template>

<style lang="stylus" scoped>
@import '../variables'
@import '../common'

._game-badge
	margin-top: $-spacing
	margin-bottom: 0

	@media $media-sm-up
		margin-bottom: $-spacing

._name
	margin-right: auto
	min-width: 0

	> *
		text-overflow()
		display: block

	&:hover
		text-decoration: none

		strong
			text-decoration: underline

._controls
	flex: none
	margin-left: 12px

._media-items
	full-bleed-xs()

	@media $media-lg-up
		margin-left: -50px
		margin-right: -50px

._media-item
	position: relative
	margin-left: auto
	margin-right: auto
	cursor: zoom-in

::v-deep(.mention-avatar-img)
	border-radius: 50% !important
</style>
