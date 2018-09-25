import View from '!view!./marketplace.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { AppGameThumbnail } from '../../../../_common/game/thumbnail/thumbnail';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

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
export default class RouteLandingMarketplace extends BaseRouteComponent {
	@State app!: Store['app'];

	firesidePosts: FiresidePost[] = [];
	games: Game[] = [];

	readonly Screen = Screen;

	@RouteResolve()
	routeResolve() {
		return Api.sendRequest('/web/marketplace');
	}

	get routeTitle() {
		return 'Sell Your Games';
	}

	routed($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('./social.png');

		this.firesidePosts = FiresidePost.populate($payload.firesidePosts);
		this.games = Game.populate($payload.games);
	}
}
