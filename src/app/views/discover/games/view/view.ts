import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./view.html';
import './view-content.styl';

import { BeforeRouteEnter } from '../../../../../lib/gj-lib-client/utils/router';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppDiscoverGamesViewNav } from './_nav/nav';
import { AppDiscoverGamesViewControls } from './_controls/controls';
import { AppGameOgrsTag } from '../../../../components/game/ogrs/tag';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppGameMaturityBlock } from '../../../../components/game/maturity-block/maturity-block';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppGameCoverButtons } from '../../../../components/game/cover-buttons/cover-buttons';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Device } from '../../../../../lib/gj-lib-client/components/device/device.service';
import { AppMeter } from '../../../../../lib/gj-lib-client/components/meter/meter';
import { RouteState, RouteAction, RouteStore, RouteMutation, RouteGetter } from './view.state';
import { EventBus } from '../../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Store } from '../../../../store/index';

@View
@Component({
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
		AppGameCoverButtons,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDiscoverGamesView extends Vue
{
	@Prop() id: string;

	@RouteState game: RouteStore['game'];
	@RouteState userPartnerKey: RouteStore['userPartnerKey'];

	@RouteGetter packages: RouteStore['packages'];

	@RouteAction bootstrap: RouteStore['bootstrap'];
	@RouteAction refreshRatingInfo: RouteStore['refreshRatingInfo'];
	@RouteMutation bootstrapGame: RouteStore['bootstrapGame'];
	@RouteMutation showMultiplePackagesMessage: RouteStore['showMultiplePackagesMessage'];

	@State app: Store['app'];

	date = date;
	Screen = makeObservableService( Screen );

	private ratingCallback?: Function;

	get ratingTooltip()
	{
		return number( this.game.rating_count || 0 ) + ' rating(s), avg: ' + this.game.avg_rating;
	}

	get installableBuilds()
	{
		const os = Device.os();
		const arch = Device.arch();
		return Game.pluckInstallableBuilds( this.packages, os, arch );
	}

	get browserBuilds()
	{
		let builds = Game.pluckBrowserBuilds( this.packages );

		// On Client we only want to include HTML games.
		if ( GJ_IS_CLIENT ) {
			builds = builds.filter( ( item ) => item.type === GameBuild.TYPE_HTML );
		}

		// Pull in ROMs to the browser builds.
		return builds.concat( Game.pluckRomBuilds( this.packages ) );
	}

	@BeforeRouteEnter( { lazy: true, cache: true, cacheTag: 'view' } )
	beforeRoute( route: VueRouter.Route )
	{
		return Api.sendRequest( '/web/discover/games/' + route.params.id );
	}

	created()
	{
		this.$store.registerModule( 'route', new RouteStore() );
		this.bootstrapGame( parseInt( this.id, 10 ) );

		// Any game rating change will broadcast this event.
		// We catch it so we can update the page with the new rating! Yay!
		this.ratingCallback = ( gameId: number ) => this.onGameRatingChange( gameId );
		EventBus.on( 'GameRating.changed', this.ratingCallback );
	}

	destroyed()
	{
		this.$store.unregisterModule( 'route' );

		if ( this.ratingCallback ) {
			EventBus.off( 'GameRating.changed', this.ratingCallback );
			this.ratingCallback = undefined;
		}
	}

	routed()
	{
		this.bootstrap( this.$payload );

		// TODO
		// If the game has a GA tracking ID, then we attach it to this
		// scope so all page views within get tracked.
		// if ( this.game.ga_tracking_id ) {
		// 	Analytics.attachAdditionalPageTracker( $scope, game.ga_tracking_id );
		// }

		// Ensure the URL for this game page.
		// We need to wait till we have a referral key for a partner.
		// This will only get through if the user is a partner.
		// Location.enforce( {
		// 	slug: game.slug,
		// 	ref: this.userPartnerKey || $location.search().ref || undefined,
		// } );

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

	onGameRatingChange( gameId: number )
	{
		if ( gameId === this.game.id ) {
			this.refreshRatingInfo();
		}
	}

	scrollToMultiplePackages()
	{
		this.showMultiplePackagesMessage();
		Scroll.to( 'game-releases' );
	}

	// TODO: Can we do this through a ref call?
	scrollToPackagePayment( _package: GamePackage )
	{
		// Scroll.to( 'game-package-card-' + _package.id );
		// $scope.$broadcast( 'Game_Package_Card.showPaymentOptions', _package );
	}
}
