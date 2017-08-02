import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./overview.html';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { RouteState, RouteStore, RouteAction } from '../../manage.store';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppProgressPoller } from '../../../../../../../lib/gj-lib-client/components/progress/poller/poller';
import { AppProgressBar } from '../../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppExpand } from '../../../../../../../lib/gj-lib-client/components/expand/expand';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppGameDevStageSelector } from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector';
import { AppGraphWidget } from '../../../../../../../lib/gj-lib-client/components/graph/widget/widget';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameOverview',
	components: {
		AppJolticon,
		AppProgressPoller,
		AppProgressBar,
		AppExpand,
		AppGameDevStageSelector,
		AppGraphWidget,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteDashGamesManageGameOverview extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];
	@RouteState canPublish: RouteStore['canPublish'];

	@RouteAction publish: RouteStore['publish'];
	@RouteAction cancel: RouteStore['cancel'];
	@RouteAction uncancel: RouteStore['uncancel'];
	@RouteAction hide: RouteStore['hide'];
	@RouteAction removeGame: RouteStore['removeGame'];

	viewCount = 0;
	downloadCount = 0;
	playCount = 0;
	commentCount = 0;

	hasBuildsProcessing = false;

	Game = Game;

	// TODO(rewrite)!
	// .run( function( $state, Payload, Location )
	// {
	// 	// If there is any sort of error while trying to go to the game dashboard, we want to direct instead to the game page.
	// 	// This usually happens if someone shares their dashboard link instead of their game page link.
	// 	// This is a bit brute force, as we will also redirect if the game doesn't exist, but in that case the game overview state will catch it.
	// 	Payload.addErrorHandler( function( event, toState, toParams, fromState, fromParams, error )
	// 	{
	// 		// Sadly, we don't have the slug, so we depend on the location enforcer to fill that in after redirecting.
	// 		if ( toState.name === 'dash.games.manage.game.overview' ) {
	// 			Location.redirectState( 'discover.games.view.overview', { slug: 'game', id: toParams.id } );

	// 			// Don't do the default error handling for the payload.
	// 			event.preventDefault();
	// 		}
	// 	} );
	// } );

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/overview/' + route.params.id);
	}

	routed() {
		Meta.title = this.$gettextInterpolate('Manage %{ game }', {
			game: this.game.title,
		});

		this.viewCount = this.$payload.viewCount || 0;
		this.downloadCount = this.$payload.downloadCount || 0;
		this.playCount = this.$payload.playCount || 0;
		this.commentCount = this.$payload.commentCount || 0;

		this.hasBuildsProcessing = this.$payload.hasBuildsProcessing || false;
	}

	// This is called if they loaded up the page and had builds in a processing
	// state but then the progress polling eventually found that they were all
	// processed. We just want to give the green light.
	onAllBuildsProcessed() {
		this.hasBuildsProcessing = false;
	}
}
