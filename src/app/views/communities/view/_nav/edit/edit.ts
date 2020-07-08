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
	},
})
export default class AppNavEdit extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	/** Inline means in the page vs in the sidebar */
	get isInline() {
		return !Screen.isLg;
	}

	get component() {
		return this.isInline ? AppNavTabList : 'nav';
	}

	get classes() {
		return this.isInline ? '-nav-inline' : 'platform-list';
	}

	get props() {
		return this.isInline ? { center: true } : {};
	}
}
