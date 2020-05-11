import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING } from '../../../../../../_common/community/channel/channel-permissions';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../../_common/scroll/scroller/scroller.vue';
import { AppStore } from '../../../../../../_common/store/app-store';
import AppCommunityChannelCard from '../../../../../components/community/channel/card/card.vue';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { Store } from '../../../../../store/index';

@Component({
	components: {
		AppCommunityPerms,
		AppCommunityChannelCard,
		AppScrollScroller,
	},
})
export default class AppCommunitiesViewOverviewNav extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(String)
	activeChannelTitle!: string;

	@State
	communities!: Store['communities'];

	@State
	communityStates!: Store['communityStates'];

	@State
	app!: AppStore;

	readonly Screen = Screen;

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	isChannelLocked(channel: CommunityChannel) {
		return (
			this.app.user &&
			!channel.permissions.canPerform(COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING)
		);
	}

	isChannelUnread(title: string) {
		if (title === 'featured') {
			return this.communityState.unreadFeatureCount > 0;
		} else if (title === 'all') {
			return false; // Never show "unread" status on the All Posts channel.
		}

		const channel = this.community.channels!.find(i => i.title === title);
		// We need to access the reactive community from the Store here.
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (channel && stateCommunity instanceof Community) {
			return this.communityState.unreadChannels.includes(channel.id);
		}
	}
}
