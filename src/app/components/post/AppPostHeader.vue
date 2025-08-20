<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { UserFollowLocation } from '../../../_common/analytics/analytics.service';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppTimeAgo from '../../../_common/time/AppTimeAgo.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppUserCardHover from '../../../_common/user/card/AppUserCardHover.vue';
import AppUserFollowButton from '../../../_common/user/follow/AppUserFollowButton.vue';
import AppUserAvatarBubble from '../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import AppActivityFeedPostTime from '../activity/feed/post/AppActivityFeedPostTime.vue';
import { ActivityFeedView } from '../activity/feed/view';
import {
	PostHeaderAvatarStyles,
	PostHeaderBylineGameStyles,
	PostHeaderBylineNameStyles,
	PostHeaderBylineStyles,
	PostHeaderBylineUsernameStyles,
	PostHeaderContentStyles,
	PostHeaderMetaStyles,
	PostHeaderStyles,
	PostHeaderTimeStyles,
} from './post-styles';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
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
	<div v-if="user" :style="PostHeaderStyles">
		<div :style="PostHeaderContentStyles">
			<AppUserCardHover :user="user" :disabled="feed && !feed.shouldShowUserCards">
				<div :style="PostHeaderAvatarStyles">
					<AppUserAvatarBubble
						:user="user"
						show-frame
						show-verified
						smoosh
						bg-color="bg-subtle"
					/>
				</div>
			</AppUserCardHover>

			<div :style="PostHeaderBylineStyles">
				<div :style="PostHeaderBylineNameStyles(overlay)">
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

					<span :style="PostHeaderBylineUsernameStyles(overlay)">
						<RouterLink
							class="link-unstyled"
							:to="{
								name: 'profile.overview',
								params: { username: user.username },
							}"
						>
							@{{ user.username }}
						</RouterLink>
					</span>
				</div>

				<div
					v-if="game && !feed?.hideGameInfo"
					:style="PostHeaderBylineGameStyles(overlay)"
				>
					<component
						:is="gameUrl ? RouterLink : 'span'"
						:to="gameUrl"
						class="link-unstyled"
					>
						{{ game.title }}
					</component>
				</div>
			</div>
		</div>
		<div :style="PostHeaderMetaStyles">
			<span v-if="showPinned">
				<span class="tag">
					<AppJolticon icon="thumbtack" />
					<AppTranslate>Pinned</AppTranslate>
				</span>
			</span>

			<span v-if="post.isActive || post.isScheduled" :style="PostHeaderTimeStyles(overlay)">
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
