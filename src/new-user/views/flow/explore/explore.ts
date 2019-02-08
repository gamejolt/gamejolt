import View from '!view!./explore.html?style=./explore.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import AppGameFollow from '../../../components/game/follow/follow';
import { store } from '../../../store/index';

@View
@Component({
	name: 'RouteFlowExplore',
	components: { AppGameFollow },
})
@RouteResolver({
	resolver: () =>
		Api.sendRequest(
			'/web/new-user/game-suggestions',
			{ tags: store.state.tags },
			{ allowComplexData: ['tags'] }
		),
})
export default class RouteFlowExplore extends BaseRouteComponent {
	games: Game[] = [];

	routeResolved($payload: any) {
		if ($payload && $payload.games) {
			this.games = Game.populate($payload.games);
		}
	}

	onClickNext() {}
}
