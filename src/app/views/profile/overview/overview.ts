import View from '!view!./overview.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';

import { AppGameThumbnail } from '../../../../_common/game/thumbnail/thumbnail';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppCommentVideoThumbnail } from '../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserLevelWidget } from '../../../components/user/level-widget/level-widget';
import { Store } from '../../../store/index';
import { RouteState, RouteStore, RouteAction } from '../profile.store';
import { UserGameSession } from '../../../../lib/gj-lib-client/components/user/game-session/game-session.model';

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
	@Prop()
	user!: User;

	@Prop()
	gamesCount!: number;

	@Prop()
	videosCount!: number;

	@Prop()
	userFriendship!: UserFriendship;

	@Prop()
	activeGameSession?: UserGameSession;

	@State
	app!: Store['app'];

	@RouteAction
	sendFriendRequest!: RouteStore['sendFriendRequest'];

	@RouteAction
	acceptFriendRequest!: RouteStore['acceptFriendRequest'];

	@RouteAction
	cancelFriendRequest!: RouteStore['cancelFriendRequest'];

	@RouteAction
	rejectFriendRequest!: RouteStore['rejectFriendRequest'];

	@RouteAction
	removeFriend!: RouteStore['removeFriend'];

	youtubeChannels: YoutubeChannel[] = [];
	showFullDescription = false;
	canToggleDescription = false;

	readonly User = User;
	readonly UserFriendship = UserFriendship;
	readonly Screen = Screen;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/profile/overview/@' + route.params.username);
	}

	get routeTitle() {
		if (this.user) {
			return `${this.user.display_name} (@${this.user.username})`;
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
		this.youtubeChannels = YoutubeChannel.populate($payload.youtubeChannels);
	}
}
