import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../../_common/community/community.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';

type NavItemType = 'general' | 'tag';

class NavItem {
	constructor(
		public readonly type: NavItemType,
		public readonly label: string,
		public readonly channel: 'featured' | string
	) {}

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

	get tags() {
		if (this.community.tags) {
			return this.community.tags.map(t => t.tag);
		}
		return [];
	}

	get groups(): NavGroup[] {
		return [
			new NavGroup([
				new NavItem('general', this.$gettext('Featured'), 'featured'),
				new NavItem('general', this.$gettext('All Posts'), 'all'),
			]),
			new NavGroup(this.tags.map(i => new NavItem('tag', i, i))),
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
