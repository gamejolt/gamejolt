<script lang="ts" setup>
import { computed, ref } from 'vue';
import { CommunityChannelModel } from '../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppCommunityChannelCard from '../../../../../components/community/channel/card/AppCommunityChannelCard.vue';
import { useAppStore } from '../../../../../store';
import { useCommunityRouteStore } from '../../view.store';

const { user } = useCommonStore();
const { toggleLeftPane, communities, communityStates } = useAppStore();
const {
	community,
	frontpageChannel,
	allChannel,
	channel: activeChannel,
	archivedChannels,
	loadArchivedChannels,
	expandedArchivedChannels,
	loadedArchivedChannels,
} = useCommunityRouteStore()!;

const isLoadingArchivedChannels = ref(false);

const communityState = computed(() => communityStates.value.getCommunityState(community.value!));

function isChannelLocked(channel: CommunityChannelModel) {
	// Don't show the locked status to guests.
	if (!user.value) {
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
	const stateCommunity = communities.value.find(c => c.id === community.value!.id);
	if (channel && stateCommunity instanceof CommunityModel) {
		return communityState.value.unreadChannels.includes(channel.id);
	}

	return false;
}

async function onClickArchivedChannels() {
	if (isLoadingArchivedChannels.value) {
		return;
	}

	expandedArchivedChannels.value = !expandedArchivedChannels.value;

	// Load in archived channels.
	if (expandedArchivedChannels.value && !loadedArchivedChannels.value) {
		isLoadingArchivedChannels.value = true;

		await loadArchivedChannels();

		loadedArchivedChannels.value = true;
		isLoadingArchivedChannels.value = false;
	}
}
</script>

<template>
	<div>
		<AppCommunityChannelCard
			:community="community!"
			:path="frontpageChannel!.title"
			:label="$gettext(`Frontpage`)"
			:background-item="frontpageChannel!.background"
			:is-active="activeChannel === frontpageChannel"
			:is-unread="isChannelUnread(frontpageChannel!)"
			@click="toggleLeftPane()"
		/>

		<AppCommunityChannelCard
			:community="community!"
			:path="allChannel!.title"
			sort="hot"
			:label="$gettext(`All Posts`)"
			:background-item="allChannel!.background"
			:is-active="activeChannel === allChannel"
			:is-unread="isChannelUnread(allChannel!)"
			@click="toggleLeftPane()"
		/>

		<h5 :style="{ marginTop: `24px` }">
			{{ $gettext(`Channels`) }}
		</h5>

		<template v-if="community!.channels">
			<AppCommunityChannelCard
				v-for="channel of community!.channels"
				:key="channel.id"
				:community="community!"
				:path="channel.title"
				:label="channel.displayTitle"
				:background-item="channel.background"
				:is-active="activeChannel === channel"
				:is-unread="isChannelUnread(channel)"
				:is-locked="isChannelLocked(channel)"
				:is-unpublished="channel.isUnpublished"
				:channel-type="channel.type"
				@click="toggleLeftPane()"
			/>
		</template>

		<template v-if="community!.has_archived_channels">
			<h5
				:style="{ marginTop: `24px`, userSelect: `none`, cursor: `pointer` }"
				@click="onClickArchivedChannels"
			>
				<AppJolticon :icon="expandedArchivedChannels ? 'chevron-down' : 'chevron-right'" />
				{{ $gettext(`Archived Channels`) }}
			</h5>

			<template
				v-if="expandedArchivedChannels || (activeChannel && activeChannel.is_archived)"
			>
				<template v-if="archivedChannels.length">
					<AppCommunityChannelCard
						v-for="channel of archivedChannels"
						:key="channel.id"
						:community="community!"
						:path="channel.title"
						:label="channel.displayTitle"
						:background-item="channel.background"
						:is-active="activeChannel === channel"
						:is-unread="isChannelUnread(channel)"
						:is-locked="isChannelLocked(channel)"
						:is-archived="channel.is_archived"
						:is-unpublished="channel.isUnpublished"
						:channel-type="channel.type"
						@click="toggleLeftPane()"
					/>
				</template>

				<template v-if="isLoadingArchivedChannels">
					<AppLoading centered />
				</template>
			</template>
		</template>
	</div>
</template>
