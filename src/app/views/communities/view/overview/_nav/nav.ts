import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../../../_common/community/community.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppCommunityChannelCard from '../../../../../components/community/channel/card/card.vue';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { Store } from '../../../../../store/index';

@Component({
	components: {
		AppCommunityPerms,
		AppCommunityChannelCard,
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

	readonly Screen = Screen;

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	isChannelUnread(title: string) {
		if (title === 'featured') {
			return this.communityState.unreadFeatureCount > 0;
		}

		const channel = this.community.channels!.find(i => i.title === title);
		// We need to access the reactive community from the Store here.
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (channel && stateCommunity instanceof Community) {
			return this.communityState.unreadChannels.includes(channel.id);
		}
	}
}
