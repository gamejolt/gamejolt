import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./devlog.html?style=./devlog.styl';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { GameScreenshot } from '../../../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { AppState } from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { GameRelease } from '../../../../../../../lib/gj-lib-client/components/game/release/release.model';
import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { AppActivityFeed } from '../../../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';

@View
@Component({
	components: {
		AppMediaBar,
		AppAd,
		AppLazyPlaceholder,
		AppFadeCollapse,
		AppActivityFeed,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverGamesViewOverviewDevlog extends Vue
{
	@Prop() isLoaded: boolean;
	@Prop() game: Game;
	@Prop() mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[];
	// @Prop() recommendedGames: Game[];
	// @Prop() userRating: GameRating;
	@Prop() packages: GamePackage[];
	@Prop() releases: GameRelease[];
	@Prop() songs: GameSong[];
	// @Prop() supporters: User[];
	// @Prop() userPartnerKey: string;
	// @Prop() partnerLink: string;
	// @Prop() twitterShareMessage: string;
	// @Prop() profileCount: number;
	// @Prop() downloadCount: number;
	// @Prop() playCount: number;
	// @Prop() ratingBreakdown: number[];
	@Prop() posts: ActivityFeedContainer;

	@State app: AppState;

	showFullDescription = false;
	canToggleDescription = false;

	Screen = makeObservableService( Screen );
	Environment = Environment;

	routed()
	{
	}

	get hasReleasesSection()
	{
		// The releases section exists if there are releases or songs.
		return this.releases.length || this.songs.length;
	}
}
