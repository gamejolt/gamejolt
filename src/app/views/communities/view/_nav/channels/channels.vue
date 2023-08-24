<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import AppCommunityChannelCard from '../../../../../components/community/channel/card/card.vue';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { useAppStore } from '../../../../../store';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	loadArchivedChannels,
} from '../../view.store';

@Options({
	components: {
		AppCommunityPerms,
		AppCommunityChannelCard,
		AppLoading,
	},
})
export default class AppNavChannels extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	isLoadingArchivedChannels = false;

	get communities() {
		return this.store.communities;
	}

	get communityStates() {
		return this.store.communityStates;
	}

	get user() {
		return this.commonStore.user;
	}

	get community() {
		return this.routeStore.community;
	}

	get frontpageChannel() {
		return this.routeStore.frontpageChannel;
	}

	get allChannel() {
		return this.routeStore.allChannel;
	}

	get activeChannel() {
		return this.routeStore.channel;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	isChannelLocked(channel: CommunityChannelModel) {
		// Don't show the locked status to guests.
		if (!this.user) {
			return false;
		}

		// Don't show for jams since you can't post.
		if (channel.type === 'competition') {
			return false;
		}

		// Don't show in the draft stage, because no one can post in that stage.
		return !channel.canPost && channel.visibility !== 'draft';
	}

	isChannelUnread(channel: CommunityChannelModel) {
		if (channel === this.allChannel) {
			// Never show "unread" status on the All Posts channel.
			return false;
		}

		if (channel === this.frontpageChannel) {
			return this.communityState.hasUnreadFeaturedPosts;
		}

		// We need to access the reactive community from the Store here.
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (channel && stateCommunity instanceof CommunityModel) {
			return this.communityState.unreadChannels.includes(channel.id);
		}

		return false;
	}

	isChannelUnpublished(channel: CommunityChannelModel) {
		return channel.isUnpublished;
	}

	async onClickArchivedChannels() {
		if (this.isLoadingArchivedChannels) {
			return;
		}

		this.routeStore.expandedArchivedChannels = !this.routeStore.expandedArchivedChannels;

		// Load in archived channels.
		if (this.routeStore.expandedArchivedChannels && !this.routeStore.loadedArchivedChannels) {
			this.isLoadingArchivedChannels = true;

			await loadArchivedChannels(this.routeStore);

			this.routeStore.loadedArchivedChannels = true;
			this.isLoadingArchivedChannels = false;
		}
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
			<AppTranslate>Channels</AppTranslate>
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
				<AppTranslate>Archived Channels</AppTranslate>
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
