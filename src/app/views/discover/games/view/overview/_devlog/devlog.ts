import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./devlog.html?style=./devlog.styl';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { GameScreenshot } from '../../../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { AppState } from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';
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
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { RouteState, RouteGetter } from '../../view.state';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';

@View
@Component({
	components: {
		AppMediaBar,
		AppAd,
		AppLazyPlaceholder,
		AppFadeCollapse,
		AppActivityFeed,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppGamePackageCard,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverGamesViewOverviewDevlog extends Vue
{
	@RouteState isOverviewLoaded: boolean;
	@RouteState game: Game;
	@RouteState mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[];
	@RouteState songs: GameSong[];
	@RouteState twitterShareMessage: string;
	@RouteState feed: ActivityFeedContainer;

	@RouteGetter packages: GamePackage[];
	@RouteGetter hasReleasesSection: boolean;

	@State app: AppState;

	showFullDescription = false;
	canToggleDescription = false;

	Screen = makeObservableService( Screen );
	Environment = Environment;
}
