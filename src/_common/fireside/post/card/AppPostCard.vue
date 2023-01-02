<script lang="ts">
import { computed, PropType, toRefs, useSlots } from 'vue';
import { RouterLink } from 'vue-router';
import { PostOpenSource, trackPostOpen } from '../../../analytics/analytics.service';
import { Environment } from '../../../environment/environment.service';
import { formatFuzzynumber } from '../../../filters/fuzzynumber';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppUserAvatar from '../../../user/user-avatar/AppUserAvatar.vue';
import { VideoPlayerControllerContext } from '../../../video/player/controller';
import { FiresidePost } from '../post-model';
import AppPostCardBase from './AppPostCardBase.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	source: {
		type: String as PropType<PostOpenSource>,
		required: true,
	},
	videoContext: {
		type: String as PropType<VideoPlayerControllerContext>,
		default: undefined,
	},
	withUser: {
		type: Boolean,
	},
	noLink: {
		type: Boolean,
	},
});

const { post, source, videoContext, withUser } = toRefs(props);
const slots = useSlots();

const mediaItem = computed(() => {
	if (post.value?.hasMedia) {
		return post.value.media[0];
	} else if (post.value?.hasVideo) {
		return post.value.videos[0].posterMediaItem;
	}
	return undefined;
});

const background = computed(() => post.value.background);
const overlay = computed(() => !!background.value || !!mediaItem.value);

const hasOverlayContent = computed(() => !!slots.overlay);

const votedOnPoll = computed(() => {
	const poll = post.value?.poll;
	for (let i = 0; i < (poll?.items.length ?? 0); i++) {
		if (poll?.items[i].is_voted) {
			return true;
		}
	}
	return false;
});

const likedPost = computed(() => {
	if (post.value?.user_like) {
		return true;
	}
	return false;
});

const userLink = computed(() => Environment.wttfBaseUrl + post.value?.user.url);
</script>

<template>
	<AppPostCardBase
		:post="post"
		:video-context="videoContext"
		:has-overlay-content="hasOverlayContent"
		:blur="hasOverlayContent"
	>
		<template #overlay>
			<slot name="overlay" />
		</template>

		<template #controls>
			<div class="-details" :class="{ '-light': overlay }">
				<template v-if="withUser">
					<AppUserAvatar class="-details-user-avatar" :user="post.user" />
					<a class="-details-user-name" :href="userLink"> @{{ post.user.username }} </a>
				</template>

				<span class="-details-spacer" />

				<template v-if="post.scheduled_for">
					<AppJolticon icon="calendar" />
				</template>

				<template v-if="post.hasPoll">
					<AppJolticon :class="{ '-voted': votedOnPoll }" icon="pedestals-numbers" />
				</template>

				<template v-if="post.is_pinned">
					<AppJolticon icon="thumbtack" />
				</template>

				<AppJolticon icon="heart-filled" :class="{ '-liked': likedPost }" />
				<span class="-details-likes">
					{{ formatFuzzynumber(post.like_count) }}
				</span>
			</div>

			<RouterLink
				v-if="!noLink"
				class="-link"
				:to="post.routeLocation"
				@click="trackPostOpen({ source })"
			/>
		</template>
	</AppPostCardBase>
</template>

<style lang="stylus" scoped>
@import './common'

$-padding = 8px

.-link
	rounded-corners-lg()
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	z-index: 1

.-light
	&
	> *
		color: var(--theme-white) !important
		text-shadow: black 1px 1px 4px

.-voted
.-liked
	color: $gj-overlay-notice !important

.-details
	position: absolute
	left: $-padding
	bottom: $-padding
	right: $-padding
	display: flex
	font-size: 13px
	font-weight: bold

	> *
		color: var(--theme-fg)

		&:not(&:last-child)
			margin-right: $-padding * 0.5

	> .jolticon
		justify-self: flex-end

	> .jolticon
	.-details-user-avatar
		flex: none
		width: 20px
		height: 20px

	.-details-user-name
		overflow: hidden
		text-overflow: ellipsis
		padding-right: $-padding * 0.5m
		margin-right: 0 !important
		white-space: nowrap

	.-details-spacer
		flex: auto
</style>
