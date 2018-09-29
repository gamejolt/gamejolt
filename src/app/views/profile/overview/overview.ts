import View from '!view!./overview.html?style=./overview.styl';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
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
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { Store } from '../../../store/index';
import { RouteAction, RouteState, RouteStore } from '../profile.store';

@View
@Component({
	name: 'RouteProfileOverview',
	components: {
		AppExpand,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteProfileOverview extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteState
	user!: RouteStore['user'];

	@RouteState
	gamesCount!: RouteStore['gamesCount'];

	@RouteState
	videosCount!: RouteStore['videosCount'];

	@RouteState
	userFriendship!: RouteStore['userFriendship'];

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

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 col-lg-7 pull-left';
	}

	get rightColClass() {
		return '-right-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-4 pull-right';
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
