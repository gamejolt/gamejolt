import { Component } from 'vue-property-decorator';
import AppAdPlacement from '../../../../../../_common/ad/placement/placement.vue';
import AppAdWidget from '../../../../../../_common/ad/widget/widget.vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppCard from '../../../../../../_common/card/card.vue';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import AppCommentAddButton from '../../../../../../_common/comment/add-button/add-button.vue';
import { Comment, getCanCommentOnModel } from '../../../../../../_common/comment/comment-model';
import { CommentState, CommentStore } from '../../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../../_common/comment/modal/modal.service';
import { CommentThreadModal } from '../../../../../../_common/comment/thread/modal.service';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../../_common/environment/environment.service';
import AppFadeCollapse from '../../../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import AppGameExternalPackageCard from '../../../../../../_common/game/external-package/card/card.vue';
import { Game } from '../../../../../../_common/game/game.model';
import AppGamePackageCard from '../../../../../../_common/game/package/card/card.vue';
import AppGameSoundtrackCard from '../../../../../../_common/game/soundtrack/card/card.vue';
import { HistoryTick } from '../../../../../../_common/history-tick/history-tick-service';
import { AppLazyPlaceholder } from '../../../../../../_common/lazy/placeholder/placeholder';
import AppMediaBar from '../../../../../../_common/media-bar/media-bar.vue';
import { Meta } from '../../../../../../_common/meta/meta-service';
import { PartnerReferral } from '../../../../../../_common/partner-referral/partner-referral-service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import AppActivityFeed from '../../../../../components/activity/feed/feed.vue';
import AppActivityFeedPlaceholder from '../../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import AppCommentOverview from '../../../../../components/comment/overview/overview.vue';
import AppGameCommunityBadge from '../../../../../components/game/community-badge/community-badge.vue';
import AppGameOgrs from '../../../../../components/game/ogrs/ogrs.vue';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import AppPageContainer from '../../../../../components/page-container/page-container.vue';
import AppPostAddButton from '../../../../../components/post/add-button/add-button.vue';
import AppRatingWidget from '../../../../../components/rating/widget/widget.vue';
import AppUserKnownFollowers from '../../../../../components/user/known-followers/known-followers.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../view.store';
import AppDiscoverGamesViewOverviewDetails from './_details/details.vue';
import AppDiscoverGamesViewOverviewRecommended from './_recommended/recommended.vue';
import AppDiscoverGamesViewOverviewStatbar from './_statbar/statbar.vue';
import AppDiscoverGamesViewOverviewSupporters from './_supporters/supporters.vue';

@Component({
	name: 'RouteDiscoverGamesViewOverview',
	components: {
		AppPageContainer,
		AppDiscoverGamesViewOverviewDetails,
		AppDiscoverGamesViewOverviewRecommended,
		AppDiscoverGamesViewOverviewSupporters,
		AppDiscoverGamesViewOverviewStatbar,
		AppGameCommunityBadge,
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
		return this.$ad.shouldShow;
	}

	get shouldShowCommentAdd() {
		return getCanCommentOnModel(this.game);
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	async routeResolved($payload: any, fromCache: boolean) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;

		if ($payload.microdata) {
			Meta.microdata = $payload.microdata;
		}

		if (this.game) {
			CommentThreadModal.showFromPermalink(this.$router, this.game, 'comments');
		}

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/posts/fetch/game/${this.game.id}`,
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
		CommentModal.show({ model: this.game, displayMode: 'comments' });
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
