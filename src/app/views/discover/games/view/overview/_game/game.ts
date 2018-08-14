import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./game.html?style=./game.styl';

import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppRatingWidget } from '../../../../../../components/rating/widget/widget';
import { AppCard } from '../../../../../../../lib/gj-lib-client/components/card/card';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppGameGrid } from '../../../../../../components/game/grid/grid';
import { AppTrophyOverview } from '../../../../../../components/trophy/overview/overview';
import { RouteState, RouteMutation, RouteStore, RouteAction } from '../../view.store';
import { Clipboard } from '../../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { AppScoreOverview } from '../../../../../../components/score/overview/overview';
import { AppGameSoundtrackCard } from '../../../../../../../lib/gj-lib-client/components/game/soundtrack/card/card';
import { Store } from '../../../../../../store/index';
import { AppUserAvatarImg } from '../../../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppGameGridPlaceholder } from '../../../../../../components/game/grid/placeholder/placeholder';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { AppActivityFeedLazy } from '../../../../../../components/lazy';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppDevlogPostAdd } from '../../../../../../components/devlog/post/add/add';
import { AppGameList } from '../../../../../../components/game/list/list';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { AppGameThumbnail } from '../../../../../../../_common/game/thumbnail/thumbnail';
import {
	CommentState,
	CommentStore,
	CommentStoreModel,
	CommentMutation,
	CommentAction,
} from '../../../../../../../lib/gj-lib-client/components/comment/comment-store';
import { AppDiscoverGamesViewOverviewRecommended } from '../_recommended/recommended';
import { CommentModal } from '../../../../../../../lib/gj-lib-client/components/comment/modal/modal.service';
import { AppDiscoverGamesViewOverviewStats } from '../_stats/stats';
import { AppCommentAddButton } from '../../../../../../../lib/gj-lib-client/components/comment/add-button/add-button';
import { AppCommentOverview } from '../../../../../../components/comment/overview/overview';
import { AppDiscoverGamesViewOverviewDetails } from '../_details/details';
import { AppDiscoverGamesViewOverviewSupporters } from '../_supporters/supporters';

@View
@Component({
	components: {
		AppDiscoverGamesViewOverviewDetails,
		AppDiscoverGamesViewOverviewStats,
		AppDiscoverGamesViewOverviewRecommended,
		AppDiscoverGamesViewOverviewSupporters,
		AppAd,
		AppAdPlacement,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppGameList,
		AppRatingWidget,
		AppCard,
		AppJolticon,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppTrophyOverview,
		AppScoreOverview,
		AppUserAvatarImg,
		AppMediaBar,
		AppCommentAddButton,
		AppCommentOverview,
		AppActivityFeed: AppActivityFeedLazy,
		AppDevlogPostAdd,
		AppGameThumbnail,
		AppGamePerms,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppDiscoverGamesViewOverviewGame extends Vue {
	@State app: Store['app'];

	@CommentState getCommentStore: CommentStore['getCommentStore'];
	@CommentAction lockCommentStore: CommentStore['lockCommentStore'];
	@CommentMutation releaseCommentStore: CommentStore['releaseCommentStore'];
	@CommentAction fetchComments: CommentStore['fetchComments'];

	@RouteState isOverviewLoaded: RouteStore['isOverviewLoaded'];
	@RouteState game: RouteStore['game'];
	@RouteState mediaItems: RouteStore['mediaItems'];
	@RouteState recommendedGames: RouteStore['recommendedGames'];
	@RouteState userRating: RouteStore['userRating'];
	@RouteState songs: RouteStore['songs'];
	@RouteState userPartnerKey: RouteStore['userPartnerKey'];
	@RouteState partnerLink: RouteStore['partnerLink'];
	@RouteState partner: RouteStore['partner'];
	@RouteState partnerKey: RouteStore['partnerKey'];
	@RouteState twitterShareMessage: RouteStore['twitterShareMessage'];
	@RouteState feed: RouteStore['feed'];
	@RouteState supporters: RouteStore['supporters'];
	@RouteState videoComments: RouteStore['videoComments'];
	@RouteState videoCommentsCount: RouteStore['videoCommentsCount'];
	@RouteState shouldShowMultiplePackagesMessage: RouteStore['shouldShowMultiplePackagesMessage'];
	@RouteState postsCount: RouteStore['postsCount'];
	@RouteState trophiesCount: RouteStore['trophiesCount'];
	@RouteState hasScores: RouteStore['hasScores'];
	@RouteState trophiesPayload: RouteStore['trophiesPayload'];
	@RouteState scoresPayload: RouteStore['scoresPayload'];
	@RouteState packages: RouteStore['packages'];
	@RouteState hasReleasesSection: RouteStore['hasReleasesSection'];
	@RouteState customGameMessages: RouteStore['customGameMessages'];

	@RouteAction loadVideoComments: RouteStore['loadVideoComments'];

	@RouteState showDetails: RouteStore['showDetails'];
	@RouteMutation toggleDetails: RouteStore['toggleDetails'];
	@RouteState canToggleDescription: RouteStore['canToggleDescription'];
	@RouteMutation setCanToggleDescription: RouteStore['setCanToggleDescription'];

	@RouteMutation addPost: RouteStore['addPost'];

	commentStore: CommentStoreModel | null = null;

	readonly Screen = Screen;
	readonly Environment = Environment;

	get hasAnyPerms() {
		return this.game.hasPerms();
	}

	get hasPartnerControls() {
		return this.game.referrals_enabled && this.userPartnerKey && this.packages.length;
	}

	/**
	 * Whether or not the achievements row should be two columns. When there is
	 * both scores and trophies, we split them in half.
	 */
	get isAchievementsTwoCol() {
		return this.hasScores && this.trophiesCount;
	}

	get comments() {
		return this.commentStore ? this.commentStore.parentComments : [];
	}

	get commentsCount() {
		return this.commentStore ? this.commentStore.count : 0;
	}

	@Watch('game.id', { immediate: true })
	@Watch('game.comments_enabled')
	async onGameChange() {
		if (this.game && this.game.comments_enabled) {
			if (this.commentStore) {
				this.releaseCommentStore(this.commentStore);
			}

			this.commentStore = await this.lockCommentStore({
				resource: 'Game',
				resourceId: this.game.id,
			});

			this.fetchComments({ store: this.commentStore });
		}
	}

	destroyed() {
		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
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
