import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./manage.html';

import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { RouteStateName, RouteState, RouteStore, RouteMutation } from './manage.state';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppJolticon,
		AppPageHeader,
		AppExpand,
		AppTimeAgo,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashGamesManage extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	@RouteMutation populate: RouteStore['populate'];

	storeName = RouteStateName;
	storeModule = RouteStore;

	Game = Game;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/' + route.params.id);
	}

	routed() {
		this.populate(this.$payload);
	}
}
