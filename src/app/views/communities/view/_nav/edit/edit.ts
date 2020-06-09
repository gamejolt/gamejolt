import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

@Component({
	components: {
		AppCommunityPerms,
		AppNavTabList,
	},
})
export default class AppNavEdit extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	isNavExpanded = false;

	readonly Screen = Screen;

	get community() {
		return this.routeStore.community;
	}

	get activeItem() {
		switch (this.$route.name) {
			case 'communities.view.edit.details':
				return this.$gettext('Details');
			case 'communities.view.edit.channels':
				return this.$gettext('Channels');
			case 'communities.view.edit.games':
				return this.$gettext('Games');
			case 'communities.view.edit.moderators':
				return this.$gettext('Moderators');
			case 'communities.view.edit.blocks':
				return this.$gettext('Blocks');
		}
		return '<Invalid Item>';
	}
}
