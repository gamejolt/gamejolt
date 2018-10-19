import View from '!view!./marketplace.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';
import { AppGameThumbnail } from '../../../../_common/game/thumbnail/thumbnail';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';

@View
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
