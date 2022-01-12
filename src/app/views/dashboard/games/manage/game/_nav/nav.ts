import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { Game } from '../../../../../../../_common/game/game.model';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../manage.store';
import AppManageGameNavRequired from './required.vue';

@Options({
	components: {
		AppManageGameNavRequired,
		AppGamePerms,
	},
})
export default class AppManageGameNav extends Vue {
	commonStore = setup(() => useCommonStore());

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	get app() {
		return this.commonStore;
	}

	Game = Game;
}
