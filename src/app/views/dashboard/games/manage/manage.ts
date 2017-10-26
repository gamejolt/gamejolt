import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./manage.html';

import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { RouteStoreName, RouteState, RouteStore, RouteMutation } from './manage.store';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { IntentService } from '../../../../components/intent/intent.service';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

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
	@AppState user: AppStore['user'];
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	@RouteMutation populate: RouteStore['populate'];

	storeName = RouteStoreName;
	storeModule = RouteStore;

	Game = Game;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'accept-game-collaboration',
			message: Translate.$gettext(`You're now a collaborator for this project!`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/developer/games/' + route.params.id);
	}

	routed() {
		this.populate(this.$payload);
	}
}
