import View from '!view!./overview.html?style=./overview.styl';
import { AppAd } from 'game-jolt-frontend-lib/components/ad/ad';
import { AppAdPlacement } from 'game-jolt-frontend-lib/components/ad/placement/placement';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppCard } from 'game-jolt-frontend-lib/components/card/card';
import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import { AppCommentAddButton } from 'game-jolt-frontend-lib/components/comment/add-button/add-button';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { AppFadeCollapse } from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppGamePackageCard } from 'game-jolt-frontend-lib/components/game/package/card/card';
import { AppGameSoundtrackCard } from 'game-jolt-frontend-lib/components/game/soundtrack/card/card';
import { HistoryTick } from 'game-jolt-frontend-lib/components/history-tick/history-tick-service';
import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import { AppMediaBar } from 'game-jolt-frontend-lib/components/media-bar/media-bar';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { PartnerReferral } from 'game-jolt-frontend-lib/components/partner-referral/partner-referral-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppCommentOverview } from '../../../../../components/comment/overview/overview';
import { AppDevlogPostAddButton } from '../../../../../components/devlog/post/add-button/add-button';
import { AppGameOgrs } from '../../../../../components/game/ogrs/ogrs';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppActivityFeedLazy } from '../../../../../components/lazy';
import { AppRatingWidget } from '../../../../../components/rating/widget/widget';
import { RouteMutation, RouteState, RouteStore } from '../view.store';
import { AppDiscoverGamesViewOverviewDetails } from './_details/details';
import { AppDiscoverGamesViewOverviewRecommended } from './_recommended/recommended';
import { AppDiscoverGamesViewOverviewStatbar } from './_statbar/statbar';
import { AppDiscoverGamesViewOverviewSupporters } from './_supporters/supporters';

@View
@Component({
	name: 'RouteDiscoverGamesViewOverview',
	components: {
		AppDiscoverGamesViewOverviewDetails,
		AppDiscoverGamesViewOverviewRecommended,
		AppDiscoverGamesViewOverviewSupporters,
		AppDiscoverGamesViewOverviewStatbar,
		AppAd,
		AppAdPlacement,
		AppRatingWidget,
		AppCard,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppMediaBar,
		AppCommentAddButton,
		AppCommentOverview,
		AppActivityFeed: AppActivityFeedLazy,
		AppDevlogPostAddButton,
		AppGamePerms,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteDiscoverGamesViewOverview extends BaseRouteComponent {
	@Prop()
	id!: string;

	@RouteState
	isOverviewLoaded!: RouteStore['isOverviewLoaded'];

	@RouteState
	game!: RouteStore['game'];

	@RouteState
	mediaItems!: RouteStore['mediaItems'];

	@RouteState
	overviewComments!: RouteStore['overviewComments'];

	@RouteState
	userRating!: RouteStore['userRating'];

	@RouteState
	songs!: RouteStore['songs'];

	@RouteState
	userPartnerKey!: RouteStore['userPartnerKey'];

	@RouteState
	partnerLink!: RouteStore['partnerLink'];

	@RouteState
	partner!: RouteStore['partner'];

	@RouteState
	partnerKey!: RouteStore['partnerKey'];

	@RouteState
	feed!: RouteStore['feed'];

	@RouteState
	supporters!: RouteStore['supporters'];

	@RouteState
	supporterCount!: RouteStore['supporterCount'];

	@RouteState
	shouldShowMultiplePackagesMessage!: RouteStore['shouldShowMultiplePackagesMessage'];

	@RouteState
	postsCount!: RouteStore['postsCount'];

	@RouteState
	packages!: RouteStore['packages'];

	@RouteState
	hasReleasesSection!: RouteStore['hasReleasesSection'];

	@RouteState
	customGameMessages!: RouteStore['customGameMessages'];

	@RouteMutation
	bootstrapFeed!: RouteStore['bootstrapFeed'];

	@RouteMutation
	processOverviewPayload!: RouteStore['processOverviewPayload'];

	@RouteState
	showDetails!: RouteStore['showDetails'];

	@RouteMutation
	toggleDetails!: RouteStore['toggleDetails'];

	@RouteMutation
	setCanToggleDescription!: RouteStore['setCanToggleDescription'];

	@RouteMutation
	addPost!: RouteStore['addPost'];

	readonly Screen = Screen;
	readonly Environment = Environment;

	@RouteResolve({ lazy: true, cache: true })
	routeResolve(this: undefined, route: Route) {
		const gameId = parseInt(route.params.id, 10);
		HistoryTick.sendBeacon('game-view', gameId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});

		// If we have a tracked partner "ref" in the URL, we want to pass that along
		// when gathering the payload.
		let apiOverviewUrl = '/web/discover/games/overview/' + route.params.id;

		const ref = PartnerReferral.getReferrer('Game', parseInt(route.params.id, 10));
		if (ref) {
			apiOverviewUrl += '?ref=' + ref;
		}

		return Api.sendRequest(apiOverviewUrl);
	}

	get routeTitle() {
		if (this.game) {
			const dev = this.game.developer;
			return `${this.game.title} by ${dev.display_name} (@${dev.username})`;
		}
		return null;
	}

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 pull-left';
	}

	get rightColClass() {
		return '-right-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-4 pull-right';
	}

	get hasAnyPerms() {
		return this.game.hasPerms();
	}

	get hasDevlogPerms() {
		return this.game.hasPerms('devlogs');
	}

	get hasPartnerControls() {
		return this.game.referrals_enabled && this.userPartnerKey && this.packages.length;
	}

	routeInit() {
		CommentModal.checkPermalink(this.$router);

		// Try pulling feed from cache.
		this.bootstrapFeed();
	}

	async routed($payload: any, fromCache: boolean) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;

		if ($payload.microdata) {
			Meta.microdata = $payload.microdata;
		}

		this.processOverviewPayload({ payload: $payload, fromCache });
	}

	copyPartnerLink() {
		if (this.partnerLink) {
			Clipboard.copy(this.partnerLink);
		}
	}

	onPostAdded(post: FiresidePost) {
		this.addPost(post);
	}

	showComments() {
		CommentModal.show({ resource: 'Game', resourceId: this.game.id });
	}
}
