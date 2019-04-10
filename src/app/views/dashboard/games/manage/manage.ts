import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { store } from '../../../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './manage.store';

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
		store.commit('theme/setPageTheme', routeStore.state.game.theme || null);
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

	routeDestroyed() {
		store.commit('theme/setPageTheme', null);
	}
}
