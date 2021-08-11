import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { numberSort } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { Game } from '../../../../../_common/game/game.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppStore } from '../../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import AppTimelineList from '../../../../../_common/timeline-list/timeline-list.vue';
import { UserGameTrophy } from '../../../../../_common/user/trophy/game-trophy.model';
import { UserSiteTrophy } from '../../../../../_common/user/trophy/site-trophy.model';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { TrophyModal } from '../../../../components/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../../components/trophy/thumbnail/thumbnail.vue';
import { RouteStore, RouteStoreModule } from '../../profile.store';

type TrophyEntry = {
	gameId?: number;
	game?: Game;
	trophies: UserBaseTrophy[];
};

@Options({
	name: 'RouteProfileTrophiesOverview',
	components: {
		AppTimelineList,
		AppTimelineListItem,
		AppTimeAgo,
		AppTrophyThumbnail,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/profile/trophies/overview/@' + route.params.username),
})
export default class RouteProfileTrophiesOverview extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	@State
	app!: AppStore;

	trophyEntries: TrophyEntry[] = [];

	canLoadMore = false;
	isLoadingMore = false;
	pageSize?: number;

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`@%{ user }'s Trophy Case`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get hasTrophies() {
		return this.trophyEntries.length > 0;
	}

	get isDev() {
		return this.app.user && this.app.user.is_developer;
	}

	get isLoggedInUser() {
		return this.user && this.app.user && this.app.user.id === this.user.id;
	}

	routeResolved($payload: any) {
		this.pageSize = $payload.pageSize;

		let trophies: UserBaseTrophy[] = [];
		if ($payload.trophies) {
			trophies = populateTrophies($payload.trophies);
		}

		if (trophies.length === 0) {
			this.canLoadMore = false;
		} else {
			for (const userTrophy of trophies) {
				this.insertTrophy(userTrophy);
			}
			this.sortEntries();
			this.updateCanLoadMore(trophies);
		}
	}

	/**
	 * Group the trophies into feed entries:
	 * Each entry is a group of trophies of the same origin (same game or site).
	 * It also creates a new entry if the difference between achieved trophies is larger than 24 hours.
	 */
	private insertTrophy(userTrophy: UserBaseTrophy) {
		// Set the game/id for this user trophy (undefined for site trophies)
		let game: Game | undefined = undefined;
		let gameId: number | undefined = undefined;
		if (userTrophy instanceof UserGameTrophy) {
			game = userTrophy.game;
			gameId = userTrophy.game_id;
		}
		// Find the previous entry for that game
		let entry = this.trophyEntries
			.slice()
			.reverse()
			.find(i => i.gameId === gameId);
		// If we have a previous entry, either append the trophy,
		// or if the entry was too long ago (more than 24 hours), unset the entry to create a new one afterwards.
		if (entry) {
			const firstTrophy = entry.trophies[0];
			if (Math.abs(firstTrophy.logged_on - userTrophy.logged_on) > 24 * 60 * 60 * 1000) {
				entry = undefined;
			} else {
				entry.trophies.push(userTrophy);
			}
		}
		// Create a new entry if none exist for this game/trophy
		if (!entry) {
			entry = { game, gameId, trophies: [userTrophy] };
			this.trophyEntries.push(entry);
		}
	}

	private updateCanLoadMore(loadedTrophies: UserBaseTrophy[]) {
		// We have to receive a page size from the api to be able to load more.
		if (!this.pageSize) {
			this.canLoadMore = false;
			return;
		}

		// When we have less than the page size in new trophies for both game AND site trophies,
		// we know there are no new trophies to load at all.
		const loadedGameTrophies = loadedTrophies.filter(i => i instanceof UserGameTrophy);
		const loadedSiteTrophies = loadedTrophies.filter(i => i instanceof UserSiteTrophy);
		if (
			loadedGameTrophies.length < this.pageSize &&
			loadedSiteTrophies.length < this.pageSize
		) {
			this.canLoadMore = false;
			return;
		}

		const allTrophies = this.trophyEntries.flatMap(i => i.trophies);
		const gameTrophies = allTrophies.filter(i => i instanceof UserGameTrophy);
		const siteTrophies = allTrophies.filter(i => i instanceof UserSiteTrophy);

		// For either trophy type:
		// When we have more than 0 new trophies and more than 0 total,
		// and the total number of trophies are divisible by the page size,
		// we can assume that there are more trophies to load.
		// This would show the load more button if there are exactly 0 new trophies to load,
		// but in that case it would load no new trophies and the above condition would hide the button afterwards.
		this.canLoadMore =
			(loadedGameTrophies.length > 0 &&
				gameTrophies.length > 0 &&
				gameTrophies.length % this.pageSize === 0) ||
			(loadedSiteTrophies.length > 0 &&
				siteTrophies.length > 0 &&
				siteTrophies.length % this.pageSize === 0);
	}

	private sortEntries() {
		this.trophyEntries = this.trophyEntries.sort((a, b) =>
			numberSort(b.trophies[0].logged_on, a.trophies[0].logged_on)
		);
	}

	onClickTrophy(userTrophy: UserBaseTrophy) {
		TrophyModal.show(userTrophy);
	}

	async onClickShowMore() {
		if (!this.user || !this.canLoadMore) {
			return;
		}

		this.isLoadingMore = true;

		let url = '/web/profile/trophies/overview/@' + this.user.username;

		// Find the oldest game and site trophy to use as scroll
		let oldestGameTrophy: UserGameTrophy | null = null,
			oldestSiteTrophy: UserSiteTrophy | null = null;

		const allTrophies = this.trophyEntries.flatMap(i => i.trophies);

		for (const userTrophy of allTrophies) {
			if (userTrophy instanceof UserGameTrophy) {
				if (!oldestGameTrophy || oldestGameTrophy.logged_on > userTrophy.logged_on) {
					oldestGameTrophy = userTrophy;
				}
			} else if (userTrophy instanceof UserSiteTrophy) {
				if (!oldestSiteTrophy || oldestSiteTrophy.logged_on > userTrophy.logged_on) {
					oldestSiteTrophy = userTrophy;
				}
			}
		}

		if (oldestGameTrophy) {
			url += `?game-scroll=${oldestGameTrophy.logged_on}`;
		}
		if (oldestSiteTrophy) {
			url += oldestGameTrophy ? '&' : '?';
			url += `site-scroll=${oldestSiteTrophy.logged_on}`;
		}

		const payload = await Api.sendRequest(url);

		let trophies: UserBaseTrophy[] = [];
		if (payload.trophies) {
			trophies = populateTrophies(payload.trophies);
		}

		if (trophies.length === 0) {
			this.canLoadMore = false;
		} else {
			for (const userTrophy of trophies) {
				this.insertTrophy(userTrophy);
			}
			this.sortEntries();
			this.updateCanLoadMore(trophies);
		}

		this.isLoadingMore = false;
	}
}
