import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./overview.html';

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
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';

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

	showFullDescription = false;
	canToggleDescription = false;

	User = User;
	UserFriendship = UserFriendship;
	Screen = makeObservableService(Screen);

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/profile/overview/@' + route.params.username);
	}

	get routeTitle() {
		if (this.user) {
			let title = `${this.user.display_name} (@${this.user.username}) - `;

			if (this.user.is_gamer) {
				title += 'An indie gamer';
			} else if (this.user.is_developer) {
				title += 'An indie game developer';
			}

			return title;
		}
		return null;
	}

	routed() {
		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = this.$payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		this.developerGames = Game.populate(this.$payload.developerGamesTeaser);
		this.youtubeChannels = YoutubeChannel.populate(this.$payload.youtubeChannels);
		this.videos = CommentVideo.populate(this.$payload.videos);
	}
}
