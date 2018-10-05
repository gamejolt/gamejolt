import View from '!view!./add.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { FormGame } from '../../../../components/forms/game/game';
import { startWizard } from '../manage/manage.store';

@View
@Component({
	name: 'RouteDashGamesAdd',
	components: {
		FormGame,
	},
})
export default class RouteDashGamesAdd extends BaseRouteComponent {
	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined, _route: Route) {
		// Make sure they can add a game.
		return Api.sendRequest('/web/dash/developer/games/add');
	}

	get routeTitle() {
		return this.$gettext('dash.games.add.page_title');
	}

	onSubmit(game: Game) {
		startWizard();

		this.$router.push({
			name: 'dash.games.manage.game.description',
			params: { id: game.id + '' },
		});
	}
}
