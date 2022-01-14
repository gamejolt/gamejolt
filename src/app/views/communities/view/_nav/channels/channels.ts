import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppLoading from '../../../../../../_common/loading/loading.vue';
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

	get communities() {
		return this.store.communities;
	}
	get communityStates() {
		return this.store.communityStates;
	}
	get user() {
		return this.commonStore.user;
	}

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

		// Don't show for jams since you can't post.
		if (channel.type === 'competition') {
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
