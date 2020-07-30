import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING } from '../../../../../../_common/community/channel/channel-permissions';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
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
	},
})
export default class AppNavChannelCards extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	@State communities!: Store['communities'];
	@State communityStates!: Store['communityStates'];
	@AppState user!: AppStore['user'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

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
		return (
			this.user &&
			!channel.permissions.canPerform(COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING)
		);
	}

	isChannelUnread(channel: CommunityChannel) {
		if (channel === this.allChannel) {
			// Never show "unread" status on the All Posts channel.
			return false;
		}

		if (channel === this.frontpageChannel) {
			return this.communityState.unreadFeatureCount > 0;
		}

		// We need to access the reactive community from the Store here.
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (channel && stateCommunity instanceof Community) {
			return this.communityState.unreadChannels.includes(channel.id);
		}

		return false;
	}

	onChangeChannel(path: string) {
		// If changing channels, hide the left pane/context sidebar.
		if (this.activeChannel && this.activeChannel.title !== path) {
			this.toggleLeftPane();
		}
	}
}
