import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./game.html?style=./game.styl';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { GameScreenshot } from '../../../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { AppState } from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { GameRating } from '../../../../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { AppRatingWidget } from '../../../../../../components/rating/widget/widget';
import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { AppCard } from '../../../../../../../lib/gj-lib-client/components/card/card';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { User } from '../../../../../../../lib/gj-lib-client/components/user/user.model';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppDiscoverGamesViewOverviewStats } from '../_stats/stats';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';
import { AppCommentWidget } from '../../../../../../../lib/gj-lib-client/components/comment/widget/widget';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';
import { AppActivityFeed } from '../../../../../../components/activity/feed/feed';
import { CommentVideo } from '../../../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppCommentVideoThumbnail } from '../../../../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { AppDiscoverGamesViewOverviewDetails } from '../_details/details';
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppGameGrid } from '../../../../../../components/game/grid/grid';
import { AppTrophyOverview } from '../../../../../../components/trophy/overview/overview';
import { RouteState, RouteMutation, RouteStore, RouteAction, RouteGetter } from '../../view.state';
import { Clipboard } from '../../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';

@View
@Component({
	components: {
		AppDiscoverGamesViewOverviewStats,
		AppDiscoverGamesViewOverviewDetails,
		AppAd,
		AppMediaBar,
		AppGameGrid,
		AppRatingWidget,
		AppCard,
		AppJolticon,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppCommentWidget,
		AppGamePackageCard,
		AppActivityFeed,
		AppCommentVideoThumbnail,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppTrophyOverview,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppDiscoverGamesViewOverviewGame extends Vue implements
	Pick<RouteStore, 'setCommentsCount'>,
	Pick<RouteStore, 'loadVideoComments'>
{
	@RouteState isOverviewLoaded: boolean;
	@RouteState game: Game;
	@RouteState mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[];
	@RouteState recommendedGames: Game[];
	@RouteState userRating: GameRating;
	@RouteState songs: GameSong[];
	@RouteState userPartnerKey: string;
	@RouteState partnerLink: string;
	@RouteState twitterShareMessage: string;
	@RouteState feed: ActivityFeedContainer;
	@RouteState trophiesCount: number;
	@RouteState hasScores: boolean;
	@RouteState supporters: User[];
	@RouteState commentsCount: number;
	@RouteState videoComments: CommentVideo[];
	@RouteState videoCommentsCount: number;
	@RouteState shouldShowMultiplePackagesMessage: boolean;

	@RouteGetter packages: GamePackage[];
	@RouteGetter hasReleasesSection: boolean;

	@RouteMutation setCommentsCount: ( count: number ) => void;
	@RouteAction loadVideoComments: () => Promise<void>;

	@State app: AppState;

	showFullDescription = false;
	canToggleDescription = false;

	Screen = makeObservableService( Screen );
	Environment = Environment;

	get hasPartnerControls()
	{
		return this.game.referrals_enabled
			&& this.userPartnerKey
			&& this.packages.length;
	}

	/**
	 * Whether or not the achievements row should be two columns. When there is
	 * both scores and trophies, we split them in half.
	 */
	get isAchievementsTwoCol()
	{
		return this.hasScores && this.trophiesCount;
	}

	copyPartnerLink()
	{
		if ( this.partnerLink ) {
			Clipboard.copy( this.partnerLink );
		}
	}
}
