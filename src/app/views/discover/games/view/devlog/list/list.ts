import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';
import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { ActivityFeedService } from '../../../../../../components/activity/feed/feed-service';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppActivityFeed } from '../../../../../../components/activity/feed/feed';
import { AppActivityFeedPlaceholder } from '../../../../../../components/activity/feed/placeholder/placeholder';

@View
@Component({
	components: {
		AppAd,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	}
})
export default class RouteDiscoverGamesViewDevlogList extends Vue
{
	@Prop() game: Game;

	feed: ActivityFeedContainer | null = null;

	Environment = Environment;
	Screen = makeObservableService( Screen );

	@BeforeRouteEnter( { cache: true, lazy: true } )
	routeEnter( this: undefined, route: VueRouter.Route )
	{
		return Api.sendRequest( '/web/discover/games/devlog/' + route.params.id );
	}

	created()
	{
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed()
	{
		Meta.title = this.$gettextInterpolate(
			'Devlog for %{ game }',
			{ game: this.game.title },
		);

		Meta.description = `Stay up to date on all the latest posts for ${this.game.title} on Game Jolt`;

		if ( !this.feed ) {
			this.feed = ActivityFeedService.bootstrap(
				FiresidePost.populate( this.$payload.posts ),
				{
					type: 'Fireside_Post',
					url: `/web/discover/games/devlog/posts/${this.game.id}`,
				},
			);
		}
	}
}
