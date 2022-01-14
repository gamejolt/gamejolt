import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { Game } from '../../../../../_common/game/game.model';
import {
	BaseRouteComponent,
	RouteResolver,
	WithRouteStore,
} from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Translate } from '../../../../../_common/translate/translate.service';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './manage.store';

export const ManageGameThemeKey = 'manage-game';

@Options({
	name: 'RouteDashGamesManage',
	components: {
		AppPageHeader,
		AppExpand,
		AppTimeAgo,
		AppGamePerms,
	},
	directives: {
		AppTooltip,
	},
})
@WithRouteStore({
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
})
@RouteResolver({
	deps: { params: ['id'], query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'accept-game-collaboration',
			message: Translate.$gettext(`You're now a collaborator for this project!`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/developer/games/' + route.params.id);
	},
	resolveStore({ payload }) {
		routeStore.commit('populate', payload);
	},
})
export default class RouteDashGamesManage extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());

	get user() {
		return this.commonStore.user;
	}

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.Mutation
	populate!: RouteStore['populate'];

	readonly Game = Game;
	readonly GAME_LOCKED_STATUS_DMCA = Game.LOCKED_STATUS_DMCA;
	readonly GAME_LOCKED_STATUS_ADULT = Game.LOCKED_STATUS_ADULT;

	routeResolved() {
		this.setPageTheme();
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(ManageGameThemeKey);
	}

	private setPageTheme() {
		const theme = this.game?.theme ?? null;
		this.themeStore.setPageTheme({
			key: ManageGameThemeKey,
			theme,
		});
	}
}
