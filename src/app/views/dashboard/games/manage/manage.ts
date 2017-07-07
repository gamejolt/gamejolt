import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./manage.html';

import { RouteResolve } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { RouteState, RouteStore, RouteMutation } from './manage.state';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';

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
export default class RouteDashGamesManage extends Vue {
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	@RouteMutation populate: RouteStore['populate'];

	Game = Game;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/' + route.params.id);
	}

	routeInit() {
		this.$store.registerModule('route', new RouteStore());
	}

	routed() {
		this.populate(this.$payload);
	}

	destroyed() {
		this.$store.unregisterModule('route');
	}
}
