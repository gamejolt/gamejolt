<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { UserFollowLocation } from '../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../_common/screen/screen-service';
import { kThemeNotice } from '../../../_common/theme/variables';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppUserCardHover from '../../../_common/user/card/AppUserCardHover.vue';
import AppUserFollowButton from '../../../_common/user/follow/AppUserFollowButton.vue';
import { styleBorderRadiusCircle } from '../../../_styles/mixins';
import AppActivityFeedPostTime from '../activity/feed/post/time/time.vue';
import { ActivityFeedView } from '../activity/feed/view';
import AppUserAvatarBubble from '../user/AppUserAvatarBubble.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	followLocation: {
		type: String as PropType<UserFollowLocation>,
		required: true,
	},
	feed: {
		type: Object as PropType<ActivityFeedView>,
		default: undefined,
	},
	showPinned: {
		type: Boolean,
	},
	dateLink: {
		type: String as PropType<string>,
		default: undefined,
	},
	isNew: {
		type: Boolean,
	},
});

const { post, feed, showPinned, dateLink } = toRefs(props);

const user = computed(() => post.value.displayUser);
const overlay = computed(() => !!post.value.background);

const game = computed(() => post.value.game);
const gameUrl = computed(() => game.value?.getUrl());

const shouldShowFollow = computed(() => {
	// Don't show follow for game posts. Only for user posts.
	if (!feed?.value?.shouldShowFollow || post.value.game) {
		return false;
	}

	if (post.value.user.blocked_you) {
		return false;
	}

	// Don't show follow if already following.
	if (!user.value || user.value.is_following) {
		return false;
	}

	return true;
});
</script>

<template>
	<div v-if="user" class="-header">
		<div class="-header-content">
			<AppUserCardHover :user="user" :disabled="feed && !feed.shouldShowUserCards">
				<div class="-header-avatar">
					<AppUserAvatarBubble
						:user="user"
						show-frame
						show-verified
						smoosh
						bg-color="bg-subtle"
					/>

					<div
						v-if="isNew"
						:style="{
							...styleBorderRadiusCircle,
							position: `absolute`,
							top: `1px`,
							left: `1px`,
							width: `12px`,
							height: `12px`,
							zIndex: 2,
							backgroundColor: kThemeNotice,
							filter: `drop-shadow(0 0 1px ${kThemeNotice})`,
						}"
					/>
				</div>
			</AppUserCardHover>

			<div class="-header-byline">
				<div class="-header-byline-name" :class="{ '-overlay-text': overlay }">
					<strong>
						<RouterLink
							class="link-unstyled"
							:class="{ '-overlay-text': overlay }"
							:to="{
								name: 'profile.overview',
								params: { username: user.username },
							}"
						>
							{{ user.display_name }}
						</RouterLink>
					</strong>

					<small class="text-muted" :class="{ '-overlay-text': overlay }">
						<RouterLink
							class="link-unstyled"
							:to="{
								name: 'profile.overview',
								params: { username: user.username },
							}"
						>
							@{{ user.username }}
						</RouterLink>
					</small>
				</div>

				<div v-if="game && !feed?.hideGameInfo" class="-header-byline-game">
					<strong class="text-muted" :class="{ '-overlay-text': overlay }">
						<component
							:is="!!gameUrl ? RouterLink : 'span'"
							:to="gameUrl"
							class="link-unstyled"
						>
							{{ game.title }}
						</component>
					</strong>
				</div>
			</div>
		</div>
		<div class="-header-meta small text-muted">
			<span v-if="showPinned">
				<span class="tag">
					<AppJolticon icon="thumbtack" />
					<AppTranslate>Pinned</AppTranslate>
				</span>
			</span>

			<span v-if="post.isActive" :class="{ '-overlay-text': overlay }">
				<AppActivityFeedPostTime v-if="dateLink" :post="post" :link="dateLink" />
				<AppTimeAgo v-else :date="post.published_on" strict />
			</span>

			<AppUserFollowButton
				v-if="shouldShowFollow"
				:user="user"
				:sm="Screen.isXs"
				:overlay="overlay"
				hide-count
				:location="followLocation"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

$-avatar-size = 40px

.-header
	display: flex
	align-items: center

.-header-avatar
	position: relative
	flex: none
	margin-right: $-item-padding-xs
	width: $-avatar-size
	height: $-avatar-size
	line-height: $-avatar-size
	margin-bottom: 4px

	@media $media-sm-up
		margin-right: $-item-padding

.-header-content
	flex: auto
	display: flex
	align-items: center
	overflow: hidden

.-header-byline
	display: flex
	flex-direction: column
	overflow: hidden

.-header-byline-name
.-header-byline-game
	text-overflow()

.-header-meta
	flex: none
	display: flex
	align-items: center
	flex-direction: row
	grid-gap: 8px
	margin-left: $-item-padding-xs
	line-height: $line-height-computed

	@media $media-sm-up
		margin-left: $-item-padding
</style>
