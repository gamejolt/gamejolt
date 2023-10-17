<script lang="ts" setup>
import { PropType, computed, onMounted, onUnmounted, toRef, toRefs } from 'vue';
import { RouteLocationRaw, RouterLink, useRoute, useRouter } from 'vue-router';
import AppButton from '../../../button/AppButton.vue';
import { GameModel } from '../../../game/game.model';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppTimeAgo from '../../../time/AppTimeAgo.vue';
import { $gettext } from '../../../translate/translate.service';
import { FiresidePostModel, FiresidePostStatus } from '../post-model';

export type Action = 'add' | 'publish' | 'scheduled-publish';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	action: {
		type: String as PropType<Action>,
		required: true,
	},
});

const emit = defineEmits({
	close: () => true,
});

const { post } = toRefs(props);
const route = useRoute();
const router = useRouter();

const isActive = toRef(() => post.value.status === FiresidePostStatus.Active);
const isScheduled = toRef(
	() => post.value.isScheduled && post.value.status === FiresidePostStatus.Draft
);
const isDraft = toRef(
	() => !post.value.isScheduled && post.value.status === FiresidePostStatus.Draft
);

const draftsLocation = computed<RouteLocationRaw>(() => getFeedLocation('draft'));
const scheduledLocation = computed<RouteLocationRaw>(() => getFeedLocation('scheduled'));

const hasOneCommunity = toRef(() => post.value.communities.length === 1);

const communityLocation = computed(() => {
	const communityLink = post.value.communities[0];
	const community = post.value.communities[0].community;
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
	if (post.value.game instanceof GameModel) {
		return {
			name: 'dash.games.manage.devlog',
			params: {
				id: post.value.game.id.toString(),
			},
			query: {
				tab,
			},
		};
	} else {
		return {
			name: 'profile.overview',
			params: {
				username: post.value.user.username,
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
