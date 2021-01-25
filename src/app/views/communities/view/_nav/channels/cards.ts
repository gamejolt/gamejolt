import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import {
	Community,
	loadArchivedChannels,
} from '../../../../../../_common/community/community.model';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { AppState, AppStore } from '../../../../../../_common/store/app-store';
import AppCommunityChannelCard from '../../../../../components/community/channel/card/card.vue';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { Store } from '../../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

/**
 * Base cards list that gets wrapped depending on how we want to display the
 * channels.
 */
@Component({
	components: {
		AppCommunityPerms,
		AppCommunityChannelCard,
		AppLoading,
	},
})
export default class AppNavChannelCards extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	@State communities!: Store['communities'];
	@State communityStates!: Store['communityStates'];
	@AppState user!: AppStore['user'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	isLoadingArchivedChannels = false;

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

	isChannelLocked(channel: CommunityChannel) {
		// Don't show the locked status to guests.
		if (!this.user) {
			return false;
		}

		// Don't show in the draft stage, because no one can post in that stage.
		return !channel.canPost && channel.visibility !== 'draft';
	}

	isChannelUnread(channel: CommunityChannel) {
		if (channel === this.allChannel) {
			// Never show "unread" status on the All Posts channel.
			return false;
		}

		if (channel === this.frontpageChannel) {
			return this.communityState.hasUnreadFeaturedPosts;
		}

		// We need to access the reactive community from the Store here.
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (channel && stateCommunity instanceof Community) {
			return this.communityState.unreadChannels.includes(channel.id);
		}

		return false;
	}

	isChannelUnpublished(channel: CommunityChannel) {
		return channel.isUnpublished;
	}

	async onClickArchivedChannels() {
		if (this.isLoadingArchivedChannels) {
			return;
		}

		this.community._expandedArchivedChannels = !this.community._expandedArchivedChannels;

		// Load in archived channels.
		if (this.community._expandedArchivedChannels && !this.community._loadedArchivedChannels) {
			this.isLoadingArchivedChannels = true;

			await loadArchivedChannels(this.community);

			this.community._loadedArchivedChannels = true;
			this.isLoadingArchivedChannels = false;
		}
	}
}
