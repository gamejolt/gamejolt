import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./devlog.html?style=./devlog.styl';

import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { RouteState, RouteStore, RouteMutation } from '../../view.store';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppGameSoundtrackCard } from '../../../../../../../lib/gj-lib-client/components/game/soundtrack/card/card';
import { Store } from '../../../../../../store/index';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppCommentPeek } from '../../../../../../components/comment/peek/peek';
import { Comment } from '../../../../../../../lib/gj-lib-client/components/comment/comment-model';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppGameGrid } from '../../../../../../components/game/grid/grid';
import { AppGameGridPlaceholder } from '../../../../../../components/game/grid/placeholder/placeholder';
import { AppActivityFeedPlaceholder } from '../../../../../../components/activity/feed/placeholder/placeholder';
import { AppCommentWidgetAddLazy, AppActivityFeedLazy } from '../../../../../../components/lazy';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppDevlogPostAdd } from '../../../../../../components/devlog/post/add/add';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@View
@Component({
	components: {
		AppAdPlacement,
		AppLazyPlaceholder,
		AppFadeCollapse,
		AppActivityFeedPlaceholder,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppCommentPeek,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppMediaBar,
		AppActivityFeed: AppActivityFeedLazy,
		AppCommentWidgetAdd: AppCommentWidgetAddLazy,
		AppJolticon,
		AppDevlogPostAdd,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverGamesViewOverviewDevlog extends Vue {
	@State app: Store['app'];

	@RouteState isOverviewLoaded: RouteStore['isOverviewLoaded'];
	@RouteState game: RouteStore['game'];
	@RouteState mediaItems: RouteStore['mediaItems'];
	@RouteState songs: RouteStore['songs'];
	@RouteState twitterShareMessage: RouteStore['twitterShareMessage'];
	@RouteState feed: RouteStore['feed'];
	@RouteState packages: RouteStore['packages'];
	@RouteState hasReleasesSection: RouteStore['hasReleasesSection'];
	@RouteState recommendedGames: RouteStore['recommendedGames'];
	@RouteState partner: RouteStore['partner'];
	@RouteState partnerKey: RouteStore['partnerKey'];
	@RouteState customGameMessages: RouteStore['customGameMessages'];

	@RouteState showDescription: RouteStore['showDescription'];
	@RouteState canToggleDescription: RouteStore['canToggleDescription'];
	@RouteMutation toggleDescription: RouteStore['toggleDescription'];
	@RouteMutation setCanToggleDescription: RouteStore['setCanToggleDescription'];

	@RouteMutation addPost: RouteStore['addPost'];

	comments: Comment[] = [];
	commentsCount = 0;

	headingColClasses = 'col-md-10 col-md-offset-1 col-lg-offset-0 col-lg-2';
	contentColClasses = 'col-md-10 col-md-offset-1 col-lg-offset-0 col-lg-7';
	contentColClassesFull = 'col-md-10 col-md-offset-1 col-lg-offset-0 col-lg-10';

	Screen = makeObservableService(Screen);
	Environment = Environment;
	number = number;

	@Watch('game.id', { immediate: true })
	async onGameChange() {
		if (this.game) {
			this.comments = [];
			this.commentsCount = 0;

			const payload = await Comment.fetch('Game', this.game.id, 1);
			this.commentsCount = payload.count;
			this.comments = Comment.populate(payload.comments);
		}
	}

	onCommentAdded(comment: Comment) {
		++this.commentsCount;
		this.comments.unshift(comment);
	}

	onPostAdded(post: FiresidePost) {
		this.addPost(post);
	}
}
