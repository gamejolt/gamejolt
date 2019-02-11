import View from '!view!./explore.html?style=./explore.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { FeaturedItem } from '../../../../app/components/featured-item/featured-item.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import AppGameFeatured from '../../../components/game/featured/featured';
import AppGameFollow from '../../../components/game/follow/follow';
import AppGamePreview from '../../../components/game/preview/preview';
import { store } from '../../../store/index';

@View
@Component({
	name: 'RouteFlowExplore',
	components: {
		AppGameFollow,
		AppGamePreview,
		AppGameFeatured,
	},
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
	featured: FeaturedItem | null = null;

	get shouldShowFeatured() {
		return !!this.featured;
	}

	routeResolved($payload: any) {
		if ($payload) {
			if ($payload.games) {
				this.games = Game.populate($payload.games);
			}
			if ($payload.featured) {
				this.featured = new FeaturedItem($payload.featured);
			}
		}
	}

	onClickNext() {}
}
