<script lang="ts" setup>
import { computed, onMounted, onUnmounted, toRef } from 'vue';
import { RouteLocationRaw, RouterLink, useRoute, useRouter } from 'vue-router';

import AppButton from '~common/button/AppButton.vue';
import {
	FiresidePostModel,
	FiresidePostStatusActive,
	FiresidePostStatusDraft,
} from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { $gettext } from '~common/translate/translate.service';

export type Action = 'add' | 'publish' | 'scheduled-publish';

type Props = {
	post: FiresidePostModel;
	action: Action;
};
const { post, action } = defineProps<Props>();

const emit = defineEmits<{
	close: [];
}>();

const route = useRoute();
const router = useRouter();

const isActive = toRef(() => post.status === FiresidePostStatusActive);
const isScheduled = toRef(() => post.isScheduled && post.status === FiresidePostStatusDraft);
const isDraft = toRef(() => !post.isScheduled && post.status === FiresidePostStatusDraft);

const draftsLocation = computed<RouteLocationRaw>(() => getFeedLocation('draft'));
const scheduledLocation = computed<RouteLocationRaw>(() => getFeedLocation('scheduled'));

const hasOneCommunity = toRef(() => post.communities.length === 1);

const communityLocation = computed(() => {
	const communityLink = post.communities[0];
	const community = post.communities[0].community;
	return {
		name: 'communities.view.overview',
		params: {
			path: community.path,
			channel: communityLink.channel!.title,
		},
	};
});

const shouldShowCommunityRedirect = computed(() => {
	if (!hasOneCommunity.value) {
		return false;
	}

	const location = communityLocation.value;
	return (
		route.name !== location.name ||
		route.params['path'] !== location.params.path ||
		route.params['channel'] !== location.params.channel
	);
});

let deregisterGuard: (() => void) | undefined;
onMounted(() => {
	// Close this modal when the user navigates.
	deregisterGuard = router.beforeResolve((_to, _from, next) => {
		emit('close');
		next();
	});
});

onUnmounted(() => {
	deregisterGuard?.();
});

function getFeedLocation(tab: string): RouteLocationRaw {
	if (post.game instanceof GameModel) {
		return {
			name: 'dash.games.manage.devlog',
			params: {
				id: post.game.id.toString(),
			},
			query: {
				tab,
			},
		};
	} else {
		return {
			name: 'profile.overview',
			params: {
				username: post.user.username,
			},
			query: {
				tab,
			},
		};
	}
}

function onClickedView() {
	// Any button clicked closes the modal.
	emit('close');
}
</script>

<template>
	<div>
		<h4 class="section-header">
			<span v-if="action === 'publish'">
				{{ $gettext(`Your post was published!`) }}
			</span>
			<span v-else-if="action === 'scheduled-publish'">
				{{ $gettext(`Your scheduled post was published!`) }}
			</span>
			<span v-else-if="isActive">
				<AppJolticon icon="share-airplane" />
				{{ $gettext(`Your post was added!`) }}
			</span>
			<span v-else-if="isDraft">
				<AppJolticon icon="edit" />
				{{ $gettext(`Your post was saved as a draft.`) }}
			</span>
			<span v-else>
				<AppJolticon icon="calendar-grid" />
				{{ $gettext(`Your post was scheduled.`) }}
			</span>
		</h4>

		<div v-if="isScheduled && post.scheduled_for">
			It's scheduled to be published automatically in
			<AppTimeAgo :date="post.scheduled_for" without-suffix />
			.
		</div>

		<div :style="{ marginTop: `16px` }">
			<RouterLink :to="post.routeLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`View Post`) }}
				</AppButton>
			</RouterLink>
			{{ ' ' }}
			<RouterLink v-if="isDraft" :to="draftsLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`All Drafts`) }}
				</AppButton>
			</RouterLink>
			<RouterLink v-else-if="isScheduled" :to="scheduledLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`All Scheduled Posts`) }}
				</AppButton>
			</RouterLink>
			<RouterLink v-else-if="shouldShowCommunityRedirect" :to="communityLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`Go to Community`) }}
				</AppButton>
			</RouterLink>
		</div>
	</div>
</template>
