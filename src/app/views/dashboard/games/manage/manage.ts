import View from '!view!./manage.html';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { store } from '../../../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './manage.store';

@View
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
