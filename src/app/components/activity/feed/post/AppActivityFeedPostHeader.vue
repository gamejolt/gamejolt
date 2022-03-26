<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import { ActivityFeedView } from '../view';
import AppActivityFeedPostTime from './time/time.vue';

const props = defineProps({
	post: {
		required: true,
		type: Object as PropType<FiresidePost>,
	},
	feed: {
		default: null,
		type: (null || Object) as PropType<ActivityFeedView | null>,
	},
	showPinned: {
		default: false,
		type: Boolean,
	},
	showDate: {
		default: false,
		type: Boolean,
	},
	dateLink: {
		default: null,
		type: String as PropType<string | null>,
	},
});

const user = computed(() => props.post.displayUser);
const overlay = computed(() => !!props.post.background);
const feed = computed(() => props.feed);

const game = computed(() => props.post.game);
const gameUrl = computed(() => game.value?.getUrl());

const shouldShowFollow = computed(() => {
	// Don't show follow for game posts. Only for user posts.
	if ((feed.value && !feed.value.shouldShowFollow) || props.post.game) {
		return false;
	}

	if (props.post.user.blocked_you) {
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
	<div v-if="user" class="-container-theme -header">
		<div class="-header-content">
			<AppUserCardHover :user="user" :disabled="feed && feed.shouldShowUserCards">
				<div class="-header-avatar">
					<div class="-header-avatar-inner">
						<AppUserAvatar :user="user" />
					</div>
				</div>
			</AppUserCardHover>

			<div class="-header-byline">
				<div class="-header-byline-name" :class="{ '-overlay-text': overlay }">
					<strong>
						<router-link
							class="link-unstyled"
							:class="{ '-overlay-text': overlay }"
							:to="{
								name: 'profile.overview',
								params: { username: user.username },
							}"
						>
							{{ user.display_name }}
							<AppUserVerifiedTick :user="user" />
						</router-link>
					</strong>

					<small class="text-muted" :class="{ '-overlay-text': overlay }">
						<router-link
							class="link-unstyled"
							:to="{
								name: 'profile.overview',
								params: { username: user.username },
							}"
						>
							@{{ user.username }}
						</router-link>
					</small>
				</div>

				<div v-if="game && !feed?.hideGameInfo" class="-header-byline-game">
					<strong class="text-muted" :class="{ '-overlay-text': overlay }">
						<router-link :to="gameUrl" class="link-unstyled">
							{{ game.title }}
						</router-link>
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

			<span v-if="showDate && post.isActive" :class="{ '-overlay-text': overlay }">
				<AppActivityFeedPostTime v-if="dateLink" :post="post" :link="dateLink" />
				<AppTimeAgo v-else :date="post.published_on" strict />
			</span>

			<AppUserFollowWidget
				v-if="shouldShowFollow"
				:user="user"
				:sm="Screen.isXs"
				hide-count
				location="feed"
			/>
		</div>
	</div>
</template>

<style lang="stylus" src="./post.styl" scoped></style>
