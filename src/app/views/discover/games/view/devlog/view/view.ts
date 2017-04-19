import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./view.html';

import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppDevlogPostView } from '../../../../../../components/devlog/post/view/view';
import { AppDevlogPostViewPlaceholder } from '../../../../../../components/devlog/post/view/placeholder/placeholder';
import { AppScrollWhen } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll-when.directive.vue';
import { Registry } from '../../../../../../../lib/gj-lib-client/components/registry/registry.service';
import { RouteState } from '../../view.state';

@View
@Component({
	components: {
		AppAd,
		AppDevlogPostView,
		AppDevlogPostViewPlaceholder,
	},
	directives: {
		AppScrollWhen,
	},
})
export default class RouteDiscoverGamesViewDevlogView extends Vue
{
	@Prop() postSlug: string;

	@RouteState game: Game;

	post: FiresidePost | null = null;

	Screen = makeObservableService( Screen );

	@BeforeRouteEnter( { lazy: true, cache: true } )
	routeEnter( this: undefined, route: VueRouter.Route )
	{
		const postHash = FiresidePost.pullHashFromUrl( route.params.postSlug );
		return Api.sendRequest( '/web/discover/games/devlog/' + route.params.id + '/' + postHash );
	}

	created()
	{
		const hash = FiresidePost.pullHashFromUrl( this.postSlug );
		this.post = Registry.find<FiresidePost>( 'FiresidePost', hash, 'hash' );
	}

	routed()
	{
		const post = new FiresidePost( this.$payload.post );
		if ( this.post ) {
			this.post.assign( post );
		}
		else {
			this.post = post;
		}

		this.post.$viewed();
		this.post.$expanded();

		// TODO
		// location.enforce( {
		// 	slug: $scope['gameCtrl'].game.slug,
		// 	postSlug: this.post.slug,
		// } );

		Meta.title = this.post.title;
		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
	}
}
