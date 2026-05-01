<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import AppActivityFeedPostTime from '~app/components/activity/feed/post/AppActivityFeedPostTime.vue';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import { UserFollowLocation } from '~common/analytics/analytics.service';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import {
	getPostHeaderAvatarStyles,
	getPostHeaderMetaStyles,
	PostHeaderBylineGameStyles,
	PostHeaderBylineNameStyles,
	PostHeaderBylineStyles,
	PostHeaderBylineUsernameStyles,
	PostHeaderContentStyles,
	PostHeaderStyles,
	PostHeaderTimeStyles,
} from '~common/post/post-styles';
import { Screen } from '~common/screen/screen-service';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import AppUserFollowButton from '~common/user/follow/AppUserFollowButton.vue';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	post: FiresidePostModel;
	followLocation: UserFollowLocation;
	feed?: ActivityFeedView;
	showPinned?: boolean;
	dateLink?: string;
};
const { post, followLocation, feed, showPinned, dateLink } = defineProps<Props>();

const user = computed(() => post.displayUser);
const overlay = computed(() => !!post.background);

const game = computed(() => post.game);
const gameUrl = computed(() => game.value?.getUrl());

const shouldShowFollow = computed(() => {
	// Don't show follow for game posts. Only for user posts.
	if (!feed?.shouldShowFollow || post.game) {
		return false;
	}

	if (post.user.blocked_you) {
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
				<div :style="getPostHeaderAvatarStyles()">
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
		<div :style="getPostHeaderMetaStyles()">
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
