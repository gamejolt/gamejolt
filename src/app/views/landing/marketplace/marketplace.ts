import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../_common/api/api.service';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { Store } from '../../../store/index';
import { AppAuthJoinLazy } from '../../lazy';

@Component({
	name: 'RouteLandingMarketplace',
	components: {
		AppGameThumbnail,
		AppAuthJoin: AppAuthJoinLazy,
		AppThemeSvg,
	},
	directives: {
		AppTrackEvent,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/marketplace'),
})
export default class RouteLandingMarketplace extends BaseRouteComponent {
	@State
	app!: Store['app'];

	firesidePosts: FiresidePost[] = [];
	games: Game[] = [];

	readonly Screen = Screen;

	get routeTitle() {
		return 'Sell Your Games';
	}

	routeResolved($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('./social.png');

		this.firesidePosts = FiresidePost.populate($payload.firesidePosts);
		this.games = Game.populate($payload.games);
	}
}
