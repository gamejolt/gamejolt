import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./marketplace.html';

import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppGameThumbnail } from '../../../components/game/thumbnail/thumbnail';
import { Store } from '../../../store/index';
import { AppAuthJoinLazy } from '../../../components/lazy';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteLandingMarketplace',
	components: {
		AppGameThumbnail,
		AppAuthJoin: AppAuthJoinLazy,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteLandingMarketplace extends BaseRouteComponent {
	@State app: Store['app'];

	firesidePosts: FiresidePost[] = [];
	games: Game[] = [];

	Screen = makeObservableService(Screen);

	@RouteResolve()
	routeResolve() {
		return Api.sendRequest('/web/marketplace');
	}

	get routeTitle() {
		return 'Sell Your Games';
	}

	routed() {
		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('./social.png');

		this.firesidePosts = FiresidePost.populate(this.$payload.firesidePosts);
		this.games = Game.populate(this.$payload.games);
	}
}
