import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { Game } from '../../../../../_common/game/game.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { WithRouteStore } from '../../../../../_common/route/route-store';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Translate } from '../../../../../_common/translate/translate.service';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { store } from '../../../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './manage.store';

export const ManageGameThemeKey = 'manage-game';

@Component({
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
	store,
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
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.Mutation
	populate!: RouteStore['populate'];

	readonly Game = Game;

	routeResolved() {
		this.setPageTheme();
	}

	routeDestroyed() {
		store.commit('theme/clearPageTheme', ManageGameThemeKey);
	}

	private setPageTheme() {
		const theme = this.game?.theme ?? null;
		store.commit('theme/setPageTheme', {
			key: ManageGameThemeKey,
			theme,
		});
	}
}
