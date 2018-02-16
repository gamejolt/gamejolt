import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./devlog.html?style=./devlog.styl';

import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppFadeCollapse } from '../../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { RouteState, RouteStore, RouteMutation } from '../../view.store';
import { AppGamePackageCard } from '../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppGameSoundtrackCard } from '../../../../../../../lib/gj-lib-client/components/game/soundtrack/card/card';
import { Store } from '../../../../../../store/index';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppCommentPeek } from '../../../../../../components/comment/peek/peek';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppActivityFeedPlaceholder } from '../../../../../../components/activity/feed/placeholder/placeholder';
import { FormCommentLazy, AppActivityFeedLazy } from '../../../../../../components/lazy';
import { AppMediaBar } from '../../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppDevlogPostAdd } from '../../../../../../components/devlog/post/add/add';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppDiscoverGamesViewOverviewRecommended } from '../_recommended/recommended';
import {
	CommentStore,
	CommentState,
	CommentAction,
	CommentMutation,
} from '../../../../../../../lib/gj-lib-client/components/comment/comment-store';

@View
@Component({
	components: {
		AppDiscoverGamesViewOverviewRecommended,
		AppAdPlacement,
		AppAd,
		AppLazyPlaceholder,
		AppFadeCollapse,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppCommentPeek,
		AppMediaBar,
		AppActivityFeedPlaceholder,
		AppActivityFeed: AppActivityFeedLazy,
		AppCommentWidgetAdd: FormCommentLazy,
		AppJolticon,
		AppDevlogPostAdd,
		AppGamePerms,
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

	@CommentState getCommentStore: CommentStore['getCommentStore'];
	@CommentAction fetchComments: CommentStore['fetchComments'];
	@CommentMutation onCommentAdd: CommentStore['onCommentAdd'];

	headingColClasses = 'col-md-10 col-md-offset-1 col-lg-offset-0 col-lg-2';
	contentColClasses = 'col-md-10 col-md-offset-1 col-lg-offset-0 col-lg-7';
	contentColClassesFull = 'col-md-10 col-md-offset-1 col-lg-offset-0 col-lg-10';

	readonly Screen = Screen;
	readonly Environment = Environment;
	readonly number = number;

	get commentStore() {
		if (this.game) {
			return this.getCommentStore('Game', this.game.id);
		}
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
			this.fetchComments({
				resource: 'Game',
				resourceId: this.game.id,
			});
		}
	}

	onPostAdded(post: FiresidePost) {
		this.addPost(post);
	}
}
