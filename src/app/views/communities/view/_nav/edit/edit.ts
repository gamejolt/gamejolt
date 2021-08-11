import { Emit, Inject, Options, Vue } from 'vue-property-decorator';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

@Options({
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
