import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./game.html?style=./game.styl';

import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppRatingWidget } from '../../../../../../components/rating/widget/widget';
import { AppCard } from '../../../../../../../lib/gj-lib-client/components/card/card';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppDiscoverGamesViewOverviewStats } from '../_stats/stats';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppCommentVideoThumbnail } from '../../../../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { AppDiscoverGamesViewOverviewDetails } from '../_details/details';
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
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
import { AppCommentWidgetLazy, AppActivityFeedLazy } from '../../../../../../components/lazy';

@View
@Component({
	components: {
		AppDiscoverGamesViewOverviewStats,
		AppDiscoverGamesViewOverviewDetails,
		AppAd,
		AppAdPlacement,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppRatingWidget,
		AppCard,
		AppJolticon,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppCommentVideoThumbnail,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppTrophyOverview,
		AppScoreOverview,
		AppUserAvatarImg,
		AppMediaBar,
		AppCommentWidget: AppCommentWidgetLazy,
		AppActivityFeed: AppActivityFeedLazy,
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
	@RouteState commentsCount: RouteStore['commentsCount'];
	@RouteState videoComments: RouteStore['videoComments'];
	@RouteState videoCommentsCount: RouteStore['videoCommentsCount'];
	@RouteState shouldShowMultiplePackagesMessage: RouteStore['shouldShowMultiplePackagesMessage'];
	@RouteState trophiesCount: RouteStore['trophiesCount'];
	@RouteState hasScores: RouteStore['hasScores'];
	@RouteState trophiesPayload: RouteStore['trophiesPayload'];
	@RouteState scoresPayload: RouteStore['scoresPayload'];
	@RouteState packages: RouteStore['packages'];
	@RouteState hasReleasesSection: RouteStore['hasReleasesSection'];

	@RouteMutation setCommentsCount: RouteStore['setCommentsCount'];
	@RouteAction loadVideoComments: RouteStore['loadVideoComments'];

	@RouteState showDescription: RouteStore['showDescription'];
	@RouteState canToggleDescription: RouteStore['canToggleDescription'];
	@RouteMutation toggleDescription: RouteStore['toggleDescription'];
	@RouteMutation setCanToggleDescription: RouteStore['setCanToggleDescription'];

	Screen = makeObservableService(Screen);
	Environment = Environment;

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

	copyPartnerLink() {
		if (this.partnerLink) {
			Clipboard.copy(this.partnerLink);
		}
	}
}
