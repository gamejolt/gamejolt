import View from '!view!./manage.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import {
	ThemeMutation,
	ThemeStore,
} from '../../../../../lib/gj-lib-client/components/theme/theme.store';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { RouteMutation, RouteState, RouteStore, RouteStoreName } from './manage.store';

@View
@Component({
	name: 'RouteDashGamesManage',
	components: {
		AppJolticon,
		AppPageHeader,
		AppExpand,
		AppTimeAgo,
		AppGamePerms,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashGamesManage extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];
	@RouteState
	game!: RouteStore['game'];
	@RouteState
	isWizard!: RouteStore['isWizard'];

	@RouteMutation
	populate!: RouteStore['populate'];
	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	storeName = RouteStoreName;
	storeModule = RouteStore;

	Game = Game;

	@RouteResolve({
		deps: { params: ['id'], query: ['intent'] },
	})
	async routeResolve(this: undefined, route: Route) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'accept-game-collaboration',
			message: Translate.$gettext(`You're now a collaborator for this project!`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/developer/games/' + route.params.id);
	}

	routed($payload: any) {
		this.populate($payload);
		this.setPageTheme(this.game.theme || null);
	}

	routeDestroy() {
		this.setPageTheme(null);
	}
}
