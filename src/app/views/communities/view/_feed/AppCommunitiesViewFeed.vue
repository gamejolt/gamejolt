<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { vAppTrackEvent } from '../../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { EventItemModel } from '../../../../../_common/event-item/event-item.model';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '../../../../../_common/illustration/illustrations';
import AppNavTabList from '../../../../../_common/nav/tab-list/AppNavTabList.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppActivityFeed from '../../../../components/activity/feed/AppActivityFeed.vue';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppPostAddButton from '../../../../components/post/add-button/AppPostAddButton.vue';
import AppBlockedNotice from '../_blocked-notice/AppBlockedNotice.vue';
import { isVirtualChannel, useCommunityRouteStore } from '../view.store';

const props = defineProps({
	// It's optional since it may not have loaded into the page yet. In that
	// case, we show a placeholder and wait.
	feed: {
		type: Object as PropType<ActivityFeedView>,
		default: undefined,
	},
});

const emit = defineEmits({
	'add-post': (_post: FiresidePostModel) => true,
	'load-new': () => true,
});

const { feed } = toRefs(props);
const routeStore = useCommunityRouteStore()!;
const { user } = useCommonStore();
const route = useRoute();

const community = toRef(() => routeStore.community);
const channel = toRef(() => routeStore.channel!);

const tab = computed(() => {
	if (route.query.sort === 'hot') {
		return 'hot';
	}
	return 'new';
});

const shouldShowPostAdd = computed(() => {
	if (community.value.isBlocked) {
		return false;
	}

	// We always show the post add button for guests.
	if (!user.value) {
		return true;
	}

	if (isVirtualChannel(routeStore, channel.value)) {
		// Only show the post add if we have at least one target channel to
		// post to.
		if (community.value.channels) {
			return community.value.channels.some(i => i.canPost);
		}
	} else {
		return channel.value.canPost;
	}

	return true;
});

const shouldShowTabs = computed(() => {
	if (channel.value === routeStore.frontpageChannel) {
		return false;
	}

	if (!feed?.value || feed.value.hasItems) {
		return true;
	}

	return false;
});

const placeholderText = computed(() => {
	if (
		!!community.value.post_placeholder_text &&
		community.value.post_placeholder_text.length > 0
	) {
		return community.value.post_placeholder_text;
	}
	return $gettext(`Share your creations!`);
});

const noPostsMessage = computed(() => {
	let message = placeholderText.value;
	// If the message does not end with one of those chars, append a `-` to separate it from the following text.
	if (!['!', '.', '?'].some(i => message.endsWith(i))) {
		message += ' -';
	}
	return message;
});

function onLoadedNew() {
	// Mark the community/channel as read after loading new posts.
	Api.sendRequest(
		`/web/communities/mark-as-read/${community.value.path}/${channel.value.title}`,
		{},
		{ detach: true }
	);

	emit('load-new');
}

function onPostUnfeatured(eventItem: EventItemModel, communityInput: CommunityModel) {
	if (
		feed?.value &&
		channel.value === routeStore.frontpageChannel &&
		community.value.id === communityInput.id
	) {
		feed.value.remove([eventItem]);
	}
}

function onPostRejected(eventItem: EventItemModel, communityInput: CommunityModel) {
	if (feed?.value && community.value.id === communityInput.id) {
		feed.value.remove([eventItem]);
	}
}

function onPostMovedChannel(eventItem: EventItemModel, movedTo: CommunityChannelModel) {
	if (
		feed?.value &&
		community.value.id === movedTo.community_id &&
		!isVirtualChannel(routeStore, channel.value) &&
		channel.value.title !== movedTo.title
	) {
		feed.value.remove([eventItem]);
	}
}
</script>

<template>
	<div>
		<AppBlockedNotice :community="community" />

		<AppPostAddButton
			v-if="shouldShowPostAdd"
			:community="community"
			:channel="channel"
			:placeholder="placeholderText"
			@add="emit('add-post', $event)"
		/>

		<AppNavTabList v-if="shouldShowTabs">
			<ul>
				<li>
					<RouterLink
						v-app-track-event="`communities-feed:change-sort:new`"
						:to="{
							name: 'communities.view.channel',
							params: {
								channel: channel.title,
							},
						}"
						:class="{
							active: tab === 'new',
						}"
					>
						{{ $gettext(`New`) }}
					</RouterLink>
				</li>
				<li>
					<RouterLink
						v-app-track-event="`communities-feed:change-sort:hot`"
						:to="{
							name: 'communities.view.channel',
							params: {
								channel: channel.title,
							},
							query: {
								sort: 'hot',
							},
						}"
						:class="{
							active: tab === 'hot',
						}"
					>
						{{ $gettext(`Hot`) }}
					</RouterLink>
				</li>
			</ul>
		</AppNavTabList>

		<AppActivityFeedPlaceholder v-if="!feed" />
		<template v-else>
			<AppActivityFeed
				v-if="feed.hasItems"
				:feed="feed"
				show-ads
				@unfeature-post="onPostUnfeatured"
				@reject-post="onPostRejected"
				@move-channel-post="onPostMovedChannel"
				@load-new="onLoadedNew"
			/>
			<div v-else-if="channel !== routeStore.frontpageChannel">
				<div v-if="channel.canPost" class="alert">
					<b>{{ $gettext(`There are no posts here yet.`) }}</b>
					{{
						$gettext(`What are you waiting for? %{ message } Make people happy.`, {
							message: noPostsMessage,
						})
					}}
				</div>
				<div v-else-if="channel.is_archived">
					<AppIllustration :asset="illNoCommentsSmall">
						<p>
							{{ $gettext(`Shhh. This channel is archived.`) }}
						</p>
					</AppIllustration>
				</div>
				<div v-else v-translate class="alert">
					{{ $gettext(`There are no posts in this channel.`) }}
				</div>
			</div>
			<div v-else class="alert">
				<div>{{ $gettext(`There are no featured posts in this community.`) }}</div>
			</div>
		</template>
	</div>
</template>
