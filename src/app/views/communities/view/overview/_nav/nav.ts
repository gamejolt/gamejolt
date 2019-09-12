import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../../_common/community/community.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';

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
}
