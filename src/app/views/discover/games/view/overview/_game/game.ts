import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
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
import { GameRelease } from '../../../../../../../lib/gj-lib-client/components/game/release/release.model';
import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
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
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCommentVideoThumbnail } from '../../../../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { AppDiscoverGamesViewOverviewDetails } from '../_details/details';
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppGameGrid } from '../../../../../../components/game/grid/grid';
import { objectPick } from '../../../../../../../lib/gj-lib-client/utils/object';
import { GameScoreTable } from '../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { AppTrophyOverview } from '../../../../../../components/trophy/overview/overview';

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
export class AppDiscoverGamesViewOverviewGame extends Vue
{
	@Prop() isLoaded: boolean;
	@Prop() game: Game;
	@Prop() mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[];
	@Prop() recommendedGames: Game[];
	@Prop() userRating: GameRating;
	@Prop() packages: GamePackage[];
	@Prop() releases: GameRelease[];
	@Prop() songs: GameSong[];
	@Prop() userPartnerKey: string;
	@Prop() partnerLink: string;
	@Prop() twitterShareMessage: string;
	@Prop() ratingBreakdown: number[];
	@Prop() feed: ActivityFeedContainer;
	@Prop() trophiesCount: number;
	@Prop() hasScores: boolean;
	@Prop() primaryScoreTable: GameScoreTable | null;

	@State app: AppState;

	profileCount = 0;
	downloadCount = 0;
	playCount = 0;
	developerGamesCount = 0;
	commentsCount = 0;
	supporters: User[] = [];

	showFullDescription = false;
	canToggleDescription = false;

	videoComments: CommentVideo[] = [];
	videoCommentsCount = 0;
	videoCommentsPage = 0;

	scoresPayload: any = null;
	trophiesPayload: any = null;

	Screen = makeObservableService( Screen );
	Environment = Environment;

	routed()
	{
		this.profileCount = this.$payload.profileCount || 0;
		this.downloadCount = this.$payload.downloadCount || 0;
		this.playCount = this.$payload.playCount || 0;
		this.developerGamesCount = this.$payload.developerGamesCount || 0;

		this.supporters = User.populate( this.$payload.supporters );

		this.videoComments = CommentVideo.populate( this.$payload.videoComments );
		this.videoCommentsCount = this.$payload.videoCommentsCount || 0;

		this.scoresPayload = objectPick( this.$payload, [
			'scoreTables',
			'scoreTable',
			'scores',
			'scoresUserBestScore',
			'scoresUserScorePlacement',
			'scoresUserScoreExperience',
		] );

		this.trophiesPayload = objectPick( this.$payload, [
			'trophies',
			'trophiesAchieved',
			'trophiesExperienceAchieved',
			'trophiesShowInvisibleTrophyMessage',
		] );
	}

	get hasReleasesSection()
	{
		// The releases section exists if there are releases or songs.
		return this.releases.length || this.songs.length;
	}

	get hasPartnerControls()
	{
		return this.game.referrals_enabled && this.userPartnerKey && this.packages.length;
	}

	get showMultiplePackagesMessage()
	{
		return false;
	}

	/**
	 * Whether or not the achievements row should be two columns. When there is
	 * both scores and trophies, we split them in half.
	 */
	get isAchievementsTwoCol()
	{
		return this.hasScores && this.trophiesCount;
	}

	updateCommentsCount( count: number )
	{
		this.commentsCount = count;
	}

	async loadVideoComments()
	{
		++this.videoCommentsPage;
		const response = await Api.sendRequest(
			'/web/discover/games/videos/'
			+ this.$route.params.id
			+ '?page=' + this.videoCommentsPage
		);
		this.videoComments = this.videoComments.concat( CommentVideo.populate( response.videos ) );
	}

	// copy partner link
}
