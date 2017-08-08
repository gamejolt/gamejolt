import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./overview.html';

import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppGameThumbnail } from '../../../components/game/thumbnail/thumbnail';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { AppUserLevelWidget } from '../../../components/user/level-widget/level-widget';
import { AppCommentVideoThumbnail } from '../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { UserGameSession } from '../../../../lib/gj-lib-client/components/user/game-session/game-session.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../../store/index';
import { AppActivityFeedPlaceholder } from '../../../components/activity/feed/placeholder/placeholder';
import { AppActivityFeed } from '../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { EventItem } from '../../../../lib/gj-lib-client/components/event-item/event-item.model';

@View
@Component({
	name: 'RouteProfileOverview',
	components: {
		AppGameThumbnailImg,
		AppExpand,
		AppJolticon,
		AppFadeCollapse,
		AppGameThumbnail,
		AppCommentVideoThumbnail,
		AppUserLevelWidget,
		AppActivityFeedPlaceholder,
		AppActivityFeed,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteProfileOverview extends BaseRouteComponent {
	@Prop() user: User;
	@Prop() gamesCount: number;
	@Prop() videosCount: number;
	@Prop() userFriendship: UserFriendship;
	@Prop() activeGameSession?: UserGameSession;

	@State app: Store['app'];

	developerGames: Game[] = [];
	youtubeChannels: YoutubeChannel[] = [];
	videos: CommentVideo[] = [];
	feed: ActivityFeedContainer | null = null;

	showFullDescription = false;
	canToggleDescription = false;

	User = User;
	UserFriendship = UserFriendship;
	Screen = makeObservableService(Screen);

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/profile/overview/@' + route.params.username);
	}

	routeInit() {
		// Try pulling feed from cache.
		if (!GJ_IS_SSR) {
			this.feed = ActivityFeedService.bootstrap();
		}
	}

	routed() {
		let title = `${this.user.display_name} (@${this.user.username}) - `;

		if (this.user.is_gamer) {
			title += 'An indie gamer';
		} else if (this.user.is_developer) {
			title += 'An indie game developer';
		}

		Meta.title = title;

		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb || {};
		Meta.fb.title = Meta.title;
		Meta.twitter = this.$payload.twitter || {};
		Meta.twitter.title = Meta.title;

		this.developerGames = Game.populate(this.$payload.developerGamesTeaser);
		this.youtubeChannels = YoutubeChannel.populate(this.$payload.youtubeChannels);
		this.videos = CommentVideo.populate(this.$payload.videos);

		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(EventItem.populate(this.$payload.feedItems), {
				type: 'EventItem',
				url: `/web/profile/feed/${this.user.id}`,
			});
		}
	}
}
