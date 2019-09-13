import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../../../_common/community/community.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { Store } from '../../../../../store/index';

class NavItem {
	constructor(public readonly label: string, public readonly channel: 'featured' | string) {}

	get routeParam() {
		return this.channel === 'featured' ? undefined : this.channel;
	}
}

class NavGroup {
	constructor(public readonly items: NavItem[]) {}
}

@Component({
	components: {
		AppCommunityPerms,
	},
})
export default class AppCommunitiesViewOverviewNav extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(String)
	channel!: string;

	@Prop(Boolean)
	isEditing!: boolean;

	@State
	communities!: Store['communities'];

	@State
	communityStates!: Store['communityStates'];

	isNavExpanded = false;

	readonly Screen = Screen;

	get titles() {
		if (this.community.channels) {
			return this.community.channels.map(t => t.title);
		}
		return [];
	}

	get groups(): NavGroup[] {
		return [
			new NavGroup([
				new NavItem(this.$gettext('Featured'), 'featured'),
				new NavItem(this.$gettext('All Posts'), 'all'),
			]),
			new NavGroup(this.titles.map(i => new NavItem(i, i))),
		];
	}

	get activeItem() {
		for (const group of this.groups) {
			for (const item of group.items) {
				if (item.channel === this.channel) {
					return item;
				}
			}
		}
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	isChannelUnread(title: string) {
		const channel = this.community.channels!.find(i => i.title === title);
		// We need to access the reactive community from the Store here.
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (channel && stateCommunity instanceof Community) {
			return this.communityState.unreadChannels.includes(channel.id);
		}
	}
}
