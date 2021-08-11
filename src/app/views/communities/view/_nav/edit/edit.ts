import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Inject } from 'vue-property-decorator';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

@Component({
	components: {
		AppCommunityPerms,
	},
})
export default class AppNavEdit extends Vue {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	@Emit('change-section') emitChangeSection(_path: string) {}

	get community() {
		return this.routeStore.community;
	}

	onChangeSection(path: string) {
		this.emitChangeSection(path);
	}
}
