import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./view.html';
import './view-content.styl';

import { enforceLocation } from '../../../../../lib/gj-lib-client/utils/router';
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
import { Device } from '../../../../../lib/gj-lib-client/components/device/device.service';
import { AppMeter } from '../../../../../lib/gj-lib-client/components/meter/meter';
import { RouteStateName, RouteState, RouteAction, RouteStore, RouteMutation } from './view.state';
import { EventBus } from '../../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Store } from '../../../../store/index';
import { Analytics } from '../../../../../lib/gj-lib-client/components/analytics/analytics.service';
import {
	RouteResolve,
	BaseRouteComponent,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

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
export default class RouteDiscoverGamesView extends BaseRouteComponent {
	@Prop() id: string;

	@RouteState game: RouteStore['game'];
	@RouteState userPartnerKey: RouteStore['userPartnerKey'];
	@RouteState packages: RouteStore['packages'];

	@RouteAction bootstrap: RouteStore['bootstrap'];
	@RouteAction refreshRatingInfo: RouteStore['refreshRatingInfo'];
	@RouteMutation bootstrapGame: RouteStore['bootstrapGame'];
	@RouteMutation showMultiplePackagesMessage: RouteStore['showMultiplePackagesMessage'];
	@RouteMutation resetDescription: RouteStore['resetDescription'];

	storeName = RouteStateName;
	storeModule = RouteStore;

	@State app: Store['app'];

	date = date;
	Screen = makeObservableService(Screen);

	private ratingCallback?: Function;
	private gaTrackingId?: string;

	get ratingTooltip() {
		return number(this.game.rating_count || 0) + ' rating(s), avg: ' + this.game.avg_rating;
	}

	get installableBuilds() {
		const os = Device.os();
		const arch = Device.arch();
		return Game.pluckInstallableBuilds(this.packages, os, arch);
	}

	get browserBuilds() {
		let builds = Game.pluckBrowserBuilds(this.packages);

		// On Client we only want to include HTML games.
		if (GJ_IS_CLIENT) {
			builds = builds.filter(item => item.type === GameBuild.TYPE_HTML);
		}

		// Pull in ROMs to the browser builds.
		return builds.concat(Game.pluckRomBuilds(this.packages));
	}

	@RouteResolve({ lazy: true, cache: true, cacheTag: 'view' })
	async routeResolve(this: undefined, route: VueRouter.Route) {
		const payload = await Api.sendRequest('/web/discover/games/' + route.params.id);

		if (payload && payload.game) {
			const redirect = enforceLocation(
				route,
				{ slug: payload.game.slug },
				{
					ref: payload.userPartnerKey || route.query.ref || undefined,
				}
			);
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	}

	routeInit() {
		this.resetDescription();
		this.bootstrapGame(parseInt(this.id, 10));

		// Any game rating change will broadcast this event. We catch it so we
		// can update the page with the new rating! Yay!
		if (!this.ratingCallback) {
			this.ratingCallback = (gameId: number) => this.onGameRatingChange(gameId);
			EventBus.on('GameRating.changed', this.ratingCallback);
		}

		// Since routes are reused when switching params (new game page) we want
		// to unset any previously set tracking IDs.
		if (this.gaTrackingId) {
			Analytics.detachAdditionalPageTracker(this.gaTrackingId);
			this.gaTrackingId = undefined;
		}
	}

	routed() {
		this.bootstrap(this.$payload);

		// If the game has a GA tracking ID, then we attach it to this
		// scope so all page views within get tracked.
		if (this.game.ga_tracking_id) {
			Analytics.attachAdditionalPageTracker(this.game.ga_tracking_id);
			this.gaTrackingId = this.game.ga_tracking_id;
		}

		// TODO(rewrite)
		// // For syncing game data to client.
		// if ( GJ_IS_CLIENT ) {

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

	routeDestroy() {
		if (this.ratingCallback) {
			EventBus.off('GameRating.changed', this.ratingCallback);
			this.ratingCallback = undefined;
		}

		if (this.game.ga_tracking_id) {
			Analytics.detachAdditionalPageTracker(this.game.ga_tracking_id);
		}
	}

	onGameRatingChange(gameId: number) {
		if (gameId === this.game.id) {
			this.refreshRatingInfo();
		}
	}

	scrollToMultiplePackages() {
		this.showMultiplePackagesMessage();
		Scroll.to('game-releases');
	}
}
