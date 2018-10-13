import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameTrophy } from '../../../../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { AppNavTabList } from '../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { UserGameTrophy } from '../../../../../../../lib/gj-lib-client/components/user/game-trophy/game-trophy.model';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTrophyCompletion } from '../../../../../../components/trophy/completion/completion';
import { AppTrophyList } from '../../../../../../components/trophy/list/list';
import { Store } from '../../../../../../store/index';
import { RouteStore, RouteStoreModule } from '../../view.store';

@View
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
