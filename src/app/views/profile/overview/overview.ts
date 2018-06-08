import View from '!view!./overview.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';

import { AppGameThumbnail } from '../../../../_common/game/thumbnail/thumbnail';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppCommentVideoThumbnail } from '../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { UserGameSession } from '../../../../lib/gj-lib-client/components/user/game-session/game-session.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserLevelWidget } from '../../../components/user/level-widget/level-widget';
import { Store } from '../../../store/index';
import {
	Provider,
	LinkedAccount,
} from '../../../../lib/gj-lib-client/components/linked-account/linked-account.model';

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

	static readonly PROVIDERS: Provider[] = [
		LinkedAccount.PROVIDER_TWITTER,
		LinkedAccount.PROVIDER_GOOGLE,
		LinkedAccount.PROVIDER_TWITCH,
	];

	developerGames: Game[] = [];
	youtubeChannels: YoutubeChannel[] = [];
	videos: CommentVideo[] = [];
	linkedAccounts: LinkedAccount[] = [];

	showFullDescription = false;
	canToggleDescription = false;

	readonly User = User;
	readonly UserFriendship = UserFriendship;
	readonly Screen = Screen;

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
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

	routed($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		this.showFullDescription = false;

		this.developerGames = Game.populate($payload.developerGamesTeaser);
		this.youtubeChannels = YoutubeChannel.populate($payload.youtubeChannels);
		this.videos = CommentVideo.populate($payload.videos);
		if (this.user.linkedAccounts) {
			this.linkedAccounts = RouteProfileOverview.PROVIDERS.filter(p =>
				this.user.linkedAccounts!.some(l => l.provider === p)
			).map(p => this.user.linkedAccounts!.find(l => l.provider === p)!);
		}
	}
}
