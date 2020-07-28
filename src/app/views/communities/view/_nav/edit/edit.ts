import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
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
}
