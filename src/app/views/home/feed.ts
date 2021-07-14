import { Component, Provide } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { router } from '..';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import AppAdWidget from '../../../_common/ad/widget/widget.vue';
import { Api } from '../../../_common/api/api.service';
import { configWhoToFollow } from '../../../_common/config/config.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import AppNavTabList from '../../../_common/nav/tab-list/tab-list.vue';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserCard from '../../../_common/user/card/card.vue';
import { User } from '../../../_common/user/user.model';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import AppCommunitySliderPlaceholder from '../../components/community/slider/placeholder/placeholder.vue';
import AppCommunitySlider from '../../components/community/slider/slider.vue';
import AppPageContainer from '../../components/page-container/page-container.vue';
import AppPostAddButton from '../../components/post/add-button/add-button.vue';
import { Store } from '../../store';
import AppHomeFireside from './_fireside/fireside.vue';
import AppHomeRecommendedUsers from './_recommended/users/users.vue';

class DashGame {
	constructor(
		public id: number,
		public title: string,
		public ownerName: string,
		public createdOn: number
	) {}
}

export class RouteActivityFeedController {
	feed: ActivityFeedView | null = null;
}

@Component({
	name: 'RouteActivityFeed',
	components: {
		AppPageContainer,
		AppCommunitySlider,
		AppCommunitySliderPlaceholder,
		AppPostAddButton,
		AppUserCard,
		AppScrollAffix,
		AppAdWidget,
		AppHomeRecommendedUsers,
		AppNavTabList,
		AppHomeFireside,
		RouteHomeActivity: () => asyncRouteLoader(import('./activity.vue'), router),
		RouteHomeFyp: () => asyncRouteLoader(import('./fyp.vue'), router),
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	resolver: () => Api.sendRequest('/web/dash/home'),
})
export default class RouteActivityFeed extends BaseRouteComponent {
	@AppState user!: AppStore['user'];
	@State communities!: Store['communities'];

	games: DashGame[] = [];
	gameFilterQuery = '';
	isShowingAllGames = false;
	loadingRecommendedUsers = false; // Set to `true` while refreshing users.
	loadingRecommendedData = true;
	recommendedUsers: User[] = [];

	readonly Screen = Screen;

	@Provide('route-activity-feed')
	controller = new RouteActivityFeedController();

	get hasGamesSection() {
		return this.games.length > 0 && Screen.isLg;
	}

	get hasGameFilter() {
		return this.games.length > 7;
	}

	get filteredGames() {
		if (this.gameFilterQuery !== '') {
			return this.games.filter(i => this.checkGameFilter(i));
		} else if (this.isShowingAllGames) {
			return this.games;
		}
		return this.games.slice(0, 7);
	}

	get isShowAllGamesVisible() {
		return !this.isShowingAllGames && this.games.length > 7 && this.gameFilterQuery === '';
	}

	get shouldShowRecommendedUsers() {
		return (
			configWhoToFollow.value &&
			(this.loadingRecommendedUsers || this.recommendedUsers.length > 0)
		);
	}

	get feedTab(): 'activity' | 'fyp' {
		return this.$route.params?.tab === 'fyp' ? 'fyp' : 'activity';
	}

	private checkGameFilter(game: DashGame) {
		let text = '';
		const search = this.gameFilterQuery.toLowerCase();

		text = game.title.toLowerCase();
		if (fuzzysearch(search, text)) {
			return true;
		}

		if (game.ownerName) {
			text = game.ownerName.toLowerCase();
			if (fuzzysearch(search, text)) {
				return true;
			}
		}

		return false;
	}

	routeResolved(payload: any, _fromCache: boolean) {
		this.games = (payload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();
	}

	mounted() {
		this.loadRecommendedData();
	}

	onPostAdded(post: FiresidePost) {
		if (this.controller.feed) {
			ActivityFeedService.onPostAdded(this.controller.feed, post, this);
		}
	}

	async refreshRecommendedUsers() {
		this.loadingRecommendedUsers = true;

		const payload = await Api.sendRequest('/web/dash/recommended/refresh', undefined, {
			detach: true,
		});
		if (payload && payload.users) {
			this.recommendedUsers = User.populate(payload.users);
		}

		this.loadingRecommendedUsers = false;
	}

	async loadRecommendedData() {
		this.loadingRecommendedData = true;

		const payload = await Api.sendRequest('/web/dash/recommended', undefined, { detach: true });
		if (payload) {
			if (payload.users) {
				this.recommendedUsers = User.populate(payload.users);
			}
		}

		this.loadingRecommendedData = false;
	}
}
