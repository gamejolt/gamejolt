import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./marketplace.html';

import { BeforeRouteEnter } from '../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { AppGameThumbnail } from '../../../components/game/thumbnail/thumbnail';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppGameThumbnail,
		AppAuthJoin,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteLandingMarketplace extends Vue {
	@State app: Store['app'];

	firesidePosts: FiresidePost[] = [];
	games: Game[] = [];

	Screen = makeObservableService(Screen);

	@BeforeRouteEnter()
	beforeRoute() {
		return Api.sendRequest('/web/marketplace');
	}

	routed() {
		Meta.title = 'Sell Your Games';

		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('./social.png');

		this.firesidePosts = FiresidePost.populate(this.$payload.firesidePosts);
		this.games = Game.populate(this.$payload.games);
	}
}
