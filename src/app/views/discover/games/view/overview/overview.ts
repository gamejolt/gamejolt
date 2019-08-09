import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import AppAdPlacement from 'game-jolt-frontend-lib/components/ad/placement/placement.vue';
import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import AppCommentAddButton from 'game-jolt-frontend-lib/components/comment/add-button/add-button.vue';
import { Comment } from 'game-jolt-frontend-lib/components/comment/comment-model';
import {
	CommentState,
	CommentStore,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { CommentThreadModal } from 'game-jolt-frontend-lib/components/comment/thread/modal.service';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import AppGameExternalPackageCard from 'game-jolt-frontend-lib/components/game/external-package/card/card.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppGamePackageCard from 'game-jolt-frontend-lib/components/game/package/card/card.vue';
import AppGameSoundtrackCard from 'game-jolt-frontend-lib/components/game/soundtrack/card/card.vue';
import { HistoryTick } from 'game-jolt-frontend-lib/components/history-tick/history-tick-service';
import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import AppMediaBar from 'game-jolt-frontend-lib/components/media-bar/media-bar.vue';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { PartnerReferral } from 'game-jolt-frontend-lib/components/partner-referral/partner-referral-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import AppActivityFeed from '../../../../../components/activity/feed/feed.vue';
import AppActivityFeedPlaceholder from '../../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import AppCommentOverview from '../../../../../components/comment/overview/overview.vue';
import AppGameOgrs from '../../../../../components/game/ogrs/ogrs.vue';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import AppPageContainer from '../../../../../components/page-container/page-container.vue';
import AppPostAddButton from '../../../../../components/post/add-button/add-button.vue';
import AppRatingWidget from '../../../../../components/rating/widget/widget.vue';
import AppUserKnownFollowers from '../../../../../components/user/known-followers/known-followers.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../view.store';
import AppDiscoverGamesViewOverviewCommunity from './_community/community.vue';
import AppDiscoverGamesViewOverviewDetails from './_details/details.vue';
import AppDiscoverGamesViewOverviewRecommended from './_recommended/recommended.vue';
import AppDiscoverGamesViewOverviewStatbar from './_statbar/statbar.vue';
import AppDiscoverGamesViewOverviewSupporters from './_supporters/supporters.vue';

@Component({
	name: 'RouteDiscoverGamesViewOverview',
	components: {
		AppPageContainer,
		AppDiscoverGamesViewOverviewCommunity,
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
		AppContentViewer,
		AppUserKnownFollowers,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		number,
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

	@RouteStoreModule.Mutation
	setOverviewComments!: RouteStore['setOverviewComments'];

	@RouteStoreModule.State
	browserBuilds!: RouteStore['browserBuilds'];

	@RouteStoreModule.State
	knownFollowers!: RouteStore['knownFollowers'];

	@RouteStoreModule.State
	knownFollowerCount!: RouteStore['knownFollowerCount'];

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	feed: ActivityFeedView | null = null;

	readonly Screen = Screen;
	readonly Environment = Environment;

	get routeTitle() {
		if (this.game) {
			let title = this.$gettextInterpolate('%{ gameTitle } by %{ user }', {
				gameTitle: this.game.title,
				user: this.game.developer.display_name,
			});

			if (this.browserBuilds.length) {
				title += ' - ' + this.$gettext('Play Online');
			}

			return title;
		}
		return null;
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

	get commentsCount() {
		if (this.game) {
			const store = this.getCommentStore('Game', this.game.id);
			return store ? store.count : 0;
		}
		return 0;
	}

	get shouldShowAds() {
		return Ads.shouldShow;
	}

	routeCreated() {
		CommentThreadModal.showFromPermalink(
			this.$router,
			'Game',
			parseInt(this.$route.params.id),
			'comments'
		);
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
				hideGameInfo: true,
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

	async reloadPreviewComments() {
		if (this.game instanceof Game) {
			const $payload = await Api.sendRequest(
				'/web/discover/games/comment-overview/' + this.game.id
			);

			this.setOverviewComments(Comment.populate($payload.comments));
		}
	}
}
