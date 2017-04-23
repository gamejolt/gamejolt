import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./devlog.html?style=./devlog.styl';

import { AppState } from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { AppActivityFeed } from '../../../../../../components/activity/feed/feed';
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { RouteState, RouteGetter, RouteStore } from '../../view.state';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppGameSoundtrackCard } from '../../../../../../../lib/gj-lib-client/components/game/soundtrack/card/card';

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
		AppGameSoundtrackCard,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverGamesViewOverviewDevlog extends Vue
{
	@RouteState isOverviewLoaded: RouteStore['isOverviewLoaded'];
	@RouteState game: RouteStore['game'];
	@RouteState mediaItems: RouteStore['mediaItems'];
	@RouteState songs: RouteStore['songs'];
	@RouteState twitterShareMessage: RouteStore['twitterShareMessage'];
	@RouteState feed: RouteStore['feed'];

	@RouteGetter packages: RouteStore['packages'];
	@RouteGetter hasReleasesSection: RouteStore['hasReleasesSection'];

	@State app: AppState;

	showFullDescription = false;
	canToggleDescription = false;

	Screen = makeObservableService( Screen );
	Environment = Environment;
}
