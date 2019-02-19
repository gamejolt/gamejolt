import View from '!view!./explore.html?style=./explore.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { FeaturedItem } from '../../../../app/components/featured-item/featured-item.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import SectionService from '../../../../_common/sections/section.service';
import AppGameFeatured from '../../../components/game/featured/featured';
import AppGameFollow from '../../../components/game/follow/follow';
import AppGamePreview from '../../../components/game/preview/preview';
import { Store } from '../../../store';

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
	resolver: () => Api.sendRequest('/web/new-user/game-suggestions'),
})
export default class RouteFlowExplore extends BaseRouteComponent {
	@State
	app!: Store['app'];

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

	async onClickNext() {
		await Api.sendRequest(
			'/web/new-user/finish',
			{},
			{
				processPayload: false,
			}
		);
		if (this.app.user instanceof User) {
			SectionService.redirectToUser(this.app.user);
		}
	}
}
