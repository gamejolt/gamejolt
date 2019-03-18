import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { GameTrophy } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/game-trophy/game-trophy.model';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppTrophyCompletion from '../../../../../../components/trophy/completion/completion.vue';
import AppTrophyList from '../../../../../../components/trophy/list/list.vue';
import { Store } from '../../../../../../store/index';
import { RouteStore, RouteStoreModule } from '../../view.store';

@Component({
	name: 'RouteDiscoverGamesViewTrophiesList',
	components: {
		AppTrophyCompletion,
		AppTrophyList,
		AppNavTabList,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/discover/games/trophies/' + route.params.id),
})
export default class RouteDiscoverGamesViewTrophiesList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@State
	app!: Store['app'];

	trophies: GameTrophy[] = [];
	achieved: UserGameTrophy[] = [];
	experience = 0;
	showInvisibleTrophyMessage = false;

	achievedIndexed: any = null;
	filteredTrophies: any = {
		achieved: [],
		unachieved: [],
	};

	currentFilter = 'all';

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Trophies for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.trophies = GameTrophy.populate($payload.trophies);
		this.achieved = $payload.trophiesAchieved
			? UserGameTrophy.populate($payload.trophiesAchieved)
			: [];
		this.experience = $payload.trophiesExperienceAchieved || 0;
		this.showInvisibleTrophyMessage = $payload.trophiesShowInvisibleTrophyMessage || false;

		this.achievedIndexed = UserGameTrophy.indexAchieved(this.achieved);
		this.filteredTrophies = GameTrophy.splitAchieved(this.trophies, this.achievedIndexed);

		this.currentFilter = 'all';
	}
}
