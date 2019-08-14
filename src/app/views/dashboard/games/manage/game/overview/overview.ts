import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppGraphWidget from 'game-jolt-frontend-lib/components/graph/widget/widget.vue';
import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import { AppProgressPoller } from 'game-jolt-frontend-lib/components/progress/poller/poller';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector.vue';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameOverview',
	components: {
		AppProgressPoller,
		AppProgressBar,
		AppExpand,
		AppGameDevStageSelector,
		AppGraphWidget,
		AppGamePerms,
		AppCommunityPerms,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/overview/' + route.params.id),
})
export default class RouteDashGamesManageGameOverview extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@RouteStoreModule.Action
	uncancel!: RouteStore['uncancel'];

	viewCount = 0;
	downloadCount = 0;
	commentCount = 0;
	dislikeCount = 0;

	hasBuildsProcessing = false;

	readonly Game = Game;

	// TODO(rewrite,cros)!
	// .run( function( $state, Payload, Location )
	// {
	// 	// If there is any sort of error while trying to go to the game dashboard, we want to direct instead to the game page.
	// 	// This usually happens if someone shares their dashboard link instead of their game page link.
	// 	// This is a bit brute force, as we will also redirect if the game doesn't exist, but in that case
	//  // the game overview state will catch it.
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

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get likeCount() {
		return this.game.like_count || 0;
	}

	get voteCount() {
		return this.likeCount + this.dislikeCount;
	}

	get averageRating() {
		if (!this.voteCount) {
			return '-';
		}

		return number(this.likeCount / this.voteCount, {
			style: 'percent',
			maximumFractionDigits: 2,
		});
	}

	routeResolved($payload: any) {
		this.viewCount = $payload.viewCount || 0;
		this.downloadCount = $payload.downloadCount || 0;
		this.commentCount = $payload.commentCount || 0;
		this.dislikeCount = $payload.dislikeCount || 0;

		this.hasBuildsProcessing = $payload.hasBuildsProcessing || false;
	}

	// This is called if they loaded up the page and had builds in a processing
	// state but then the progress polling eventually found that they were all
	// processed. We just want to give the green light.
	onAllBuildsProcessed() {
		this.hasBuildsProcessing = false;
	}
}
