import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import AppAdPlaywireVideo from '../../../_common/ad/playwire/video.vue';
import { AppTrackEvent } from '../../../_common/analytics/track-event.directive';
import { Api } from '../../../_common/api/api.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Meta } from '../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import AppUserCard from '../../../_common/user/card/card.vue';
import { User } from '../../../_common/user/user.model';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeed from '../../components/activity/feed/feed.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../components/activity/feed/view';
import AppBroadcastCard from '../../components/broadcast-card/broadcast-card.vue';
import AppCommunitySlider from '../../components/community/slider/slider.vue';
import AppPageContainer from '../../components/page-container/page-container.vue';
import AppPostAddButton from '../../components/post/add-button/add-button.vue';
import { Store, store } from '../../store';
import AppHomeRecommended from './_recommended/recommended.vue';

class DashGame {
	constructor(
		public id: number,
		public title: string,
		public ownerName: string,
		public createdOn: number
	) {}
}

@Component({
	name: 'RouteActivityFeed',
	components: {
		AppPageContainer,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppBroadcastCard,
		AppCommunitySlider,
		AppPostAddButton,
		AppUserCard,
		AppScrollAffix,
		AppAdPlaywireVideo,
		AppHomeRecommended,
	},
	directives: {
		AppTrackEvent,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { query: ['feed_last_id'] },
	resolver: ({ route }) =>
		Promise.all([
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/activity')),
			Api.sendRequest('/web/dash/home'),
		]),
	resolveStore({ payload, fromCache }) {
		const [feedPayload] = payload;

		// Don't set if from cache, otherwise it could reset to the cached count
		// when switching between tabs.
		if (!fromCache) {
			// We clear the notifications for the tab we are on, and load in
			// counts for the other tab.
			store.commit('setNotificationCount', { type: 'activity', count: 0 });
			store.commit('setNotificationCount', {
				type: 'notifications',
				count: feedPayload.notificationsUnreadCount,
			});
		}
	},
})
export default class RouteActivityFeed extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@State
	communities!: Store['communities'];

	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	feed: ActivityFeedView | null = null;
	games: DashGame[] = [];
	gameFilterQuery = '';
	isShowingAllGames = false;
	loadingRecommendedUsers = true;
	recommendedUsers: User[] = [];

	readonly Screen = Screen;

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
		return this.loadingRecommendedUsers || this.recommendedUsers.length > 0;
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

	routeCreated() {
		Meta.setTitle(null);
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved([feedPayload, homePayload]: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: `/web/dash/activity/more/activity`,
				notificationWatermark: feedPayload.unreadWatermark,
			},
			feedPayload.items,
			fromCache
		);

		this.games = (homePayload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();
	}

	mounted() {
		this.loadRecommendedUsers();
	}

	loadedNew() {
		this.setNotificationCount({ type: 'activity', count: 0 });
	}

	onPostAdded(post: FiresidePost) {
		if (this.app.user) {
			ActivityFeedService.onPostAdded(this.feed!, post, this);
		}
	}

	async onRecommendedUsersRefresh() {
		await this.loadRecommendedUsers(true);
	}

	async loadRecommendedUsers(refresh = false) {
		this.loadingRecommendedUsers = true;

		let url = '/web/dash/recommended';
		if (refresh) {
			url += '/refresh';
		}
		try {
			const $payload = await Api.sendRequest(url, undefined, {
				detach: true,
			});
			if ($payload && $payload.users) {
				this.recommendedUsers = User.populate($payload.users);
			}
		} catch (error) {
			console.error('error during fetching recommended users.', error);
		}

		this.loadingRecommendedUsers = false;
	}
}
