<script lang="ts" setup>
import { ref, toRef } from 'vue';
import { CommunityChannelModel } from '../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppCommunityChannelCard from '../../../../../components/community/channel/card/AppCommunityChannelCard.vue';
import { useAppStore } from '../../../../../store';
import { loadArchivedChannels, useCommunityRouteStore } from '../../view.store';

const store = useAppStore();
const { user } = useCommonStore();
const routeStore = useCommunityRouteStore()!;

const isLoadingArchivedChannels = ref(false);

const communities = toRef(() => store.communities);
const communityStates = toRef(() => store.communityStates);
const community = toRef(() => routeStore.community);
const frontpageChannel = toRef(() => routeStore.frontpageChannel);
const allChannel = toRef(() => routeStore.allChannel);
const activeChannel = toRef(() => routeStore.channel);
const communityState = toRef(() => communityStates.value.value.getCommunityState(community.value));

function isChannelLocked(channel: CommunityChannelModel) {
	// Don't show the locked status to guests.
	if (!user) {
		return false;
	}

	// Don't show for jams since you can't post.
	if (channel.type === 'competition') {
		return false;
	}

	// Don't show in the draft stage, because no one can post in that stage.
	return !channel.canPost && channel.visibility !== 'draft';
}

function isChannelUnread(channel: CommunityChannelModel) {
	if (channel === allChannel.value) {
		// Never show "unread" status on the All Posts channel.
		return false;
	}

	if (channel === frontpageChannel.value) {
		return communityState.value.hasUnreadFeaturedPosts;
	}

	// We need to access the reactive community from the Store here.
	const stateCommunity = communities.value.value.find(c => c.id === community.value.id);
	if (channel && stateCommunity instanceof CommunityModel) {
		return communityState.value.unreadChannels.includes(channel.id);
	}

	return false;
}

function isChannelUnpublished(channel: CommunityChannelModel) {
	return channel.isUnpublished;
}

async function onClickArchivedChannels() {
	if (isLoadingArchivedChannels.value) {
		return;
	}

	routeStore.expandedArchivedChannels = !routeStore.expandedArchivedChannels;

	// Load in archived channels.
	if (routeStore.expandedArchivedChannels && !routeStore.loadedArchivedChannels) {
		isLoadingArchivedChannels.value = true;

		await loadArchivedChannels(routeStore);

		routeStore.loadedArchivedChannels = true;
		isLoadingArchivedChannels.value = false;
	}
}
</script>

<template>
	<div>
		<AppCommunityChannelCard
			:community="community"
			:path="frontpageChannel.title"
			:label="$gettext(`Frontpage`)"
			:background-item="frontpageChannel.background"
			:is-active="activeChannel === frontpageChannel"
			:is-unread="isChannelUnread(frontpageChannel)"
			@click="store.toggleLeftPane()"
		/>

		<AppCommunityChannelCard
			:community="community"
			:path="allChannel.title"
			sort="hot"
			:label="$gettext(`All Posts`)"
			:background-item="allChannel.background"
			:is-active="activeChannel === allChannel"
			:is-unread="isChannelUnread(allChannel)"
			@click="store.toggleLeftPane()"
		/>

		<h5 class="-heading">
			{{ $gettext(`Channels`) }}
		</h5>

		<template v-if="community.channels">
			<AppCommunityChannelCard
				v-for="channel of community.channels"
				:key="channel.id"
				:community="community"
				:path="channel.title"
				:label="channel.displayTitle"
				:background-item="channel.background"
				:is-active="activeChannel === channel"
				:is-unread="isChannelUnread(channel)"
				:is-locked="isChannelLocked(channel)"
				:is-unpublished="isChannelUnpublished(channel)"
				:channel-type="channel.type"
				@click="store.toggleLeftPane()"
			/>
		</template>

		<template v-if="community.has_archived_channels">
			<h5 class="-heading -archived-heading" @click="onClickArchivedChannels">
				<AppJolticon
					:icon="routeStore.expandedArchivedChannels ? 'chevron-down' : 'chevron-right'"
				/>
				{{ $gettext(`Archived Channels`) }}
			</h5>

			<template
				v-if="
					routeStore.expandedArchivedChannels ||
					(activeChannel && activeChannel.is_archived)
				"
			>
				<template v-if="routeStore.archivedChannels.length">
					<AppCommunityChannelCard
						v-for="channel of routeStore.archivedChannels"
						:key="channel.id"
						:community="community"
						:path="channel.title"
						:label="channel.displayTitle"
						:background-item="channel.background"
						:is-active="activeChannel === channel"
						:is-unread="isChannelUnread(channel)"
						:is-locked="isChannelLocked(channel)"
						:is-archived="channel.is_archived"
						:is-unpublished="isChannelUnpublished(channel)"
						:channel-type="channel.type"
						@click="store.toggleLeftPane()"
					/>
				</template>

				<template v-if="isLoadingArchivedChannels">
					<AppLoading centered />
				</template>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-heading
	margin-top: 24px

.-archived-heading
	user-select: none
	cursor: pointer
</style>
