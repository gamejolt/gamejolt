import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

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

@Component({})
export default class AppCommunitiesViewOverviewNav extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Array)
	tags!: string[];

	@Prop(String)
	channel!: string;

	isNavExpanded = false;

	readonly Screen = Screen;

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
