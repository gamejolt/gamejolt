import View from '!view!./add.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseRouteComponent,
	RouteResolver,
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
@RouteResolver({
	deps: {},
	// Make sure they can add a game.
	resolver: () => Api.sendRequest('/web/dash/developer/games/add'),
})
export default class RouteDashGamesAdd extends BaseRouteComponent {
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
