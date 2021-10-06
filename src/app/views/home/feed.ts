import { Component, Provide } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { router } from '..';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import { trackExperimentEngagement } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import { configHomeNav } from '../../../_common/config/config.service';
import { AppConfigLoaded } from '../../../_common/config/loaded';
import { Fireside } from '../../../_common/fireside/fireside.model';
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
import { EventBus, EventBusDeregister } from '../../../_common/system/event/event-bus.service';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserCard from '../../../_common/user/card/card.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import AppCommunitySliderPlaceholder from '../../components/community/slider/placeholder/placeholder.vue';
import AppCommunitySlider from '../../components/community/slider/slider.vue';
import { GRID_EVENT_FIRESIDE_START } from '../../components/grid/client.service';
import AppPageContainer from '../../components/page-container/page-container.vue';
import AppPostAddButton from '../../components/post/add-button/add-button.vue';
import { Store } from '../../store';
import { LibraryModule, LibraryStore } from '../../store/library';
import { HomeFeedService, HOME_FEED_ACTIVITY, HOME_FEED_FYP } from './home-feed.service';
import AppHomeFireside from './_fireside/fireside.vue';

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
		AppNavTabList,
		AppHomeFireside,
		AppConfigLoaded,
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
	@State unreadActivityCount!: Store['unreadActivityCount'];
	@LibraryModule.State developerCollection!: LibraryStore['developerCollection'];

	games: DashGame[] = [];
	gameFilterQuery = '';
	isShowingAllGames = false;

	firesideStartDeregister: EventBusDeregister | null = null;
	isLoadingFiresides = true;
	isFiresidesBootstrapped = false;
	featuredFireside: Fireside | null = null;
	userFireside: Fireside | null = null;
	firesides: Fireside[] = [];

	readonly Screen = Screen;
	readonly HomeFeedService = HomeFeedService;

	@Provide('route-activity-feed')
	controller = new RouteActivityFeedController();

	get hasSimpleHome() {
		return Screen.isLg && configHomeNav.value === 'simple';
	}

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

	get defaultTab() {
		return HomeFeedService.getDefault();
	}

	get tabs() {
		if (HomeFeedService.getDefault() === HOME_FEED_FYP) {
			return [HOME_FEED_FYP, HOME_FEED_ACTIVITY];
		}

		return [HOME_FEED_ACTIVITY, HOME_FEED_FYP];
	}

	get feedTab() {
		return HomeFeedService.getRouteFeedTab(this.$route);
	}

	get hasUnreadActivity() {
		return this.unreadActivityCount > 0;
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
		if (Screen.isLg) {
			trackExperimentEngagement(configHomeNav);
		}

		this.games = (payload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();

		this.refreshFiresides();
		this.firesideStartDeregister = EventBus.on(GRID_EVENT_FIRESIDE_START, () =>
			this.refreshFiresides()
		);
	}

	routeDestroyed() {
		if (this.firesideStartDeregister) {
			this.firesideStartDeregister();
			this.firesideStartDeregister = null;
		}
	}

	onPostAdded(post: FiresidePost) {
		if (this.controller.feed) {
			ActivityFeedService.onPostAdded(this.controller.feed, post, this);
		}
	}

	async refreshFiresides() {
		if (!this.user) {
			return;
		}

		this.isLoadingFiresides = true;
		try {
			const payload = await Api.sendRequest(`/web/fireside/user-list`, undefined, {
				detach: true,
			});
			this.userFireside = payload.userFireside ? new Fireside(payload.userFireside) : null;
			this.firesides = payload.firesides ? Fireside.populate(payload.firesides) : [];
			this.featuredFireside = payload.featuredFireside
				? new Fireside(payload.featuredFireside)
				: null;
		} catch (error) {
			console.error('Failed to refresh fireside data.', error);
		}
		this.isLoadingFiresides = false;
		this.isFiresidesBootstrapped = true;
	}
}
