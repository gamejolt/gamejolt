import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./game.html?style=./game.styl';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppGameThumbnail } from '../../../../../../components/game/thumbnail/thumbnail';
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

@View
@Component({
	name: 'discover-games-view-overview-game',
	components: {
		AppDiscoverGamesViewOverviewStats,
		AppAd,
		AppMediaBar,
		AppGameThumbnail,
		AppRatingWidget,
		AppCard,
		AppJolticon,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppCommentWidget,
		AppGamePackageCard,
		AppActivityFeed,
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
	@Prop() supporters: User[];
	@Prop() userPartnerKey: string;
	@Prop() partnerLink: string;
	@Prop() twitterShareMessage: string;
	@Prop() profileCount: number;
	@Prop() downloadCount: number;
	@Prop() playCount: number;
	@Prop() ratingBreakdown: number[];
	@Prop() posts: ActivityFeedContainer;

	@State app: AppState;

	showFullDescription = false;
	canToggleDescription = false;
	commentsCount = 0;

	Screen = makeObservableService( Screen );
	Environment = Environment;

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

	updateCommentsCount( count: number )
	{
		this.commentsCount = count;
	}

	// copy partner link
}
