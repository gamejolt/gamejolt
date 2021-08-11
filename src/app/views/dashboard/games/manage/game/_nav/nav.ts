import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Game } from '../../../../../../../_common/game/game.model';
import { AppStore } from '../../../../../../../_common/store/app-store';
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

	@State
	app!: AppStore;

	Game = Game;
}
