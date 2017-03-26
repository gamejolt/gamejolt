import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./view.html';
import './view-content.styl';

import { BeforeRouteEnter } from '../../../../../lib/gj-lib-client/utils/router';
import { Registry } from '../../../../../lib/gj-lib-client/components/registry/registry.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { GameScoreTable } from '../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { EventBus } from '../../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { GameRating } from '../../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { Clipboard } from '../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Comment } from '../../../../../lib/gj-lib-client/components/comment/comment-model';
import { AppState } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppDiscoverGamesViewNav } from './_nav/nav';
import { AppDiscoverGamesViewControls } from './_controls/controls';
import { AppGameOgrsTag } from '../../../../components/game/ogrs/tag';
import { AppMeter } from '../../../../components/meter/meter';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppGameMaturityBlock } from '../../../../components/game/maturity-block/maturity-block';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';

@View
@Component({
	name: 'route-discover-games-view',
	components: {
		AppJolticon,
		AppPageHeader,
		AppUserAvatar,
		AppDiscoverGamesViewNav,
		AppDiscoverGamesViewControls,
		AppGameOgrsTag,
		AppMeter,
		AppTimeAgo,
		AppGameMaturityBlock,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDiscoverGamesView extends Vue
{
	@Prop() id: string;

	@State app: AppState;

	isLoaded = false;
	game: Game = Registry.find( 'Game', this.id ) || null;
	installableBuilds: GameBuild[] = [];
	browserBuilds: GameBuild[] = [];

	commentsCount = 0;
	postsCount = 0;
	trophiesCount = 0;
	hasScores = false;
	primaryScoreTable: GameScoreTable | null = null;
	twitterShareMessage = 'Check out this game!';

	partnerLink: string | null = null;
	userPartnerKey: string | null = null;

	userRating: GameRating | null = null;
	ratingBreakdown: number[] = [];

	date = date;
	Screen = makeObservableService( Screen );

	get ratingTooltip()
	{
		if ( !this.game ) {
			return undefined;
		}

		return number( this.game.rating_count || 0 ) + ' rating(s), avg: ' + this.game.avg_rating;
	}

	@BeforeRouteEnter( { lazy: true, cache: true, cacheTag: 'view' } )
	beforeRoute( route: VueRouter.Route )
	{
		return Api.sendRequest( '/web/discover/games/' + route.params.id );
	}

	routed()
	{
		this.isLoaded = true;

		// Load in the full data that we have for the game.
		const game = new Game( this.$payload.game );
		if ( this.game ) {
			this.game.assign( game );
		}
		else {
			this.game = game;
		}

		this.postsCount = this.$payload.postCount || 0;
		this.trophiesCount = this.$payload.trophiesCount || 0;
		this.hasScores = this.$payload.hasScores || false;
		this.primaryScoreTable = this.$payload.primaryScoreTable ? new GameScoreTable( this.$payload.primaryScoreTable ) : null;
		this.twitterShareMessage = this.$payload.twitterShareMessage || 'Check out this game!';

		this.partnerLink = null;
		this.userPartnerKey = this.$payload.userPartnerKey;
		if ( this.userPartnerKey ) {
			// this.partnerLink = Environment.baseUrl + $state.href( 'discover.games.view.overview', {
			// 	id: this.game.id,
			// 	slug: this.game.slug,
			// 	ref: this.userPartnerKey,
			// } );
		}

		this.processRatingPayload( this.$payload );

		// Ensure the URL for this game page.
		// We need to wait till we have a referral key for a partner.
		// This will only get through if the user is a partner.
		// Location.enforce( {
		// 	slug: game.slug,
		// 	ref: this.userPartnerKey || $location.search().ref || undefined,
		// } );

		this.loadCommentsCount();

		// Any game rating change will broadcast this event.
		// We catch it so we can update the page with the new rating! Yay!
		EventBus.on( 'GameRating.changed', ( gameId: number ) => this.onGameRatingChange( gameId ) );

		// // For syncing game data to client.
		// if ( Environment.isClient ) {

		// 	// Only sync if it's in library.
		// 	return $injector.get( 'LocalDb_Game' ).fetch( game.id )
		// 		.then( function( localGame )
		// 		{
		// 			if ( localGame ) {
		// 				return $injector.get( 'LocalDb_Sync' ).syncGame( game.id, game );
		// 			}
		// 		} );
		// }
	}

	@Watch( 'game' )
	onGameChange( game: Game )
	{
		if ( !game ) {
			return;
		}

		// TODO
		// If the game has a GA tracking ID, then we attach it to this scope so all page views within get tracked.
		// if ( game.ga_tracking_id ) {
		// 	Analytics.attachAdditionalPageTracker( $scope, game.ga_tracking_id );
		// }
	}

	async loadCommentsCount()
	{
		const response = await Comment.fetch( 'Game', this.game.id, 1 );
		this.commentsCount = response.count || 0;
	}

	async refreshRatingInfo()
	{
		const payload = await Api.sendRequest(
			'/web/discover/games/refresh-rating-info/' + this.game.id,
			undefined,
			{ detach: true },
		);

		this.processRatingPayload( payload );
	}

	processRatingPayload( payload: any )
	{
		this.userRating = payload.userRating ? new GameRating( payload.userRating ) : null;
		this.ratingBreakdown = payload.ratingBreakdown;
		this.game.rating_count = payload.game.rating_count;
		this.game.avg_rating = payload.game.avg_rating;
	}

	onGameRatingChange( gameId: number )
	{
		if ( gameId === this.game.id ) {
			this.refreshRatingInfo();
		}
	}

	report()
	{
		// Report_Modal.show( _this.game );
	}

	// scrollToMultiplePackages()
	// {
	// 	_this.showMultiplePackagesMessage = true;
	// 	Scroll.to( 'game-releases' );
	// }

	// scrollToPackagePayment( _package )
	// {
	// 	Scroll.to( 'game-package-card-' + _package.id );
	// 	$scope.$broadcast( 'Game_Package_Card.showPaymentOptions', _package );
	// }

	copyPartnerLink()
	{
		if ( this.partnerLink ) {
			Clipboard.copy( this.partnerLink );
		}
	}
}
