import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./add.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { FormGame } from '../../../../components/forms/game/game';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { startWizard } from '../manage/manage.store';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesAdd',
	components: {
		FormGame,
	},
})
export default class RouteDashGamesAdd extends BaseRouteComponent {
	@RouteResolve()
	routeResolve(this: undefined, _route: Route) {
		return User.touch();
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
