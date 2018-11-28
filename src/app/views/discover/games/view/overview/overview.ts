import View from '!view!./overview.html?style=./overview.styl';
import { AppAdPlacement } from 'game-jolt-frontend-lib/components/ad/placement/placement';
import { AppAdWidget } from 'game-jolt-frontend-lib/components/ad/widget/widget';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppCard } from 'game-jolt-frontend-lib/components/card/card';
import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import { AppCommentAddButton } from 'game-jolt-frontend-lib/components/comment/add-button/add-button';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { AppFadeCollapse } from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppGameExternalPackageCard } from 'game-jolt-frontend-lib/components/game/external-package/card/card';
import { AppGamePackageCard } from 'game-jolt-frontend-lib/components/game/package/card/card';
import { AppGameSoundtrackCard } from 'game-jolt-frontend-lib/components/game/soundtrack/card/card';
import { HistoryTick } from 'game-jolt-frontend-lib/components/history-tick/history-tick-service';
import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import { AppMediaBar } from 'game-jolt-frontend-lib/components/media-bar/media-bar';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { PartnerReferral } from 'game-jolt-frontend-lib/components/partner-referral/partner-referral-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component, Prop } from 'vue-property-decorator';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import { AppCommentOverview } from '../../../../../components/comment/overview/overview';
import { AppGameOgrs } from '../../../../../components/game/ogrs/ogrs';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppPostAddButton } from '../../../../../components/post/add-button/add-button';
import { AppRatingWidget } from '../../../../../components/rating/widget/widget';
import { trackGamePage3ColSplitTest } from '../../../../../components/split-test/split-test-service';
import { RouteStore, routeStore, RouteStoreModule } from '../view.store';
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
		AppAdWidget,
		AppAdPlacement,
		AppRatingWidget,
		AppCard,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppGameExternalPackageCard,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppMediaBar,
		AppCommentAddButton,
		AppCommentOverview,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppPostAddButton,
		AppGamePerms,
	},
	directives: {
		AppTrackEvent,
	},
})
@RouteResolver({
	lazy: true,
	cache: true,
	deps: { query: ['feed_last_id'] },
	resolver({ route }) {
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

		return Api.sendRequest(ActivityFeedService.makeFeedUrl(route, apiOverviewUrl));
	},
	resolveStore({ payload, fromCache }) {
		routeStore.commit('processOverviewPayload', { payload, fromCache });
	},
})
export default class RouteDiscoverGamesViewOverview extends BaseRouteComponent {
	@Prop()
	id!: string;

	@RouteStoreModule.State
	isOverviewLoaded!: RouteStore['isOverviewLoaded'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	mediaItems!: RouteStore['mediaItems'];

	@RouteStoreModule.State
	overviewComments!: RouteStore['overviewComments'];

	@RouteStoreModule.State
	userRating!: RouteStore['userRating'];

	@RouteStoreModule.State
	songs!: RouteStore['songs'];

	@RouteStoreModule.State
	userPartnerKey!: RouteStore['userPartnerKey'];

	@RouteStoreModule.State
	partnerLink!: RouteStore['partnerLink'];

	@RouteStoreModule.State
	partner!: RouteStore['partner'];

	@RouteStoreModule.State
	partnerKey!: RouteStore['partnerKey'];

	@RouteStoreModule.State
	supporters!: RouteStore['supporters'];

	@RouteStoreModule.State
	supporterCount!: RouteStore['supporterCount'];

	@RouteStoreModule.State
	shouldShowMultiplePackagesMessage!: RouteStore['shouldShowMultiplePackagesMessage'];

	@RouteStoreModule.State
	postsCount!: RouteStore['postsCount'];

	@RouteStoreModule.State
	packages!: RouteStore['packages'];

	@RouteStoreModule.State
	externalPackages!: RouteStore['externalPackages'];

	@RouteStoreModule.State
	hasReleasesSection!: RouteStore['hasReleasesSection'];

	@RouteStoreModule.State
	customGameMessages!: RouteStore['customGameMessages'];

	@RouteStoreModule.Mutation
	processOverviewPayload!: RouteStore['processOverviewPayload'];

	@RouteStoreModule.State
	showDetails!: RouteStore['showDetails'];

	@RouteStoreModule.Mutation
	toggleDetails!: RouteStore['toggleDetails'];

	@RouteStoreModule.Mutation
	setCanToggleDescription!: RouteStore['setCanToggleDescription'];

	feed: ActivityFeedView | null = null;

	readonly Screen = Screen;
	readonly Environment = Environment;

	get routeTitle() {
		if (this.game) {
			const dev = this.game.developer;
			return `${this.game.title} by ${dev.display_name} (@${dev.username})`;
		}
		return null;
	}

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 col-lg-7 pull-left';
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

	routeCreated() {
		trackGamePage3ColSplitTest();
		CommentModal.checkPermalink(this.$router);
		this.feed = ActivityFeedService.routeInit(this);
	}

	async routeResolved($payload: any, fromCache: boolean) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;

		if ($payload.microdata) {
			Meta.microdata = $payload.microdata;
		}

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/posts/fetch/game/${this.game.id}`,
				shouldShowEditControls: true,
			},
			$payload.posts,
			fromCache
		);
	}

	copyPartnerLink() {
		if (this.partnerLink) {
			Clipboard.copy(this.partnerLink);
		}
	}

	showComments() {
		CommentModal.show({ resource: 'Game', resourceId: this.game.id, displayMode: 'comments' });
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}
}
