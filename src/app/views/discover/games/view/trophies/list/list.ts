import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GameTrophy } from '../../../../../../../_common/game/trophy/trophy.model';
import AppNavTabList from '../../../../../../../_common/nav/tab-list/tab-list.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { UserGameTrophy } from '../../../../../../../_common/user/trophy/game-trophy.model';
import AppTrophyCompletion from '../../../../../../components/trophy/completion/completion.vue';
import AppTrophyList from '../../../../../../components/trophy/list/list.vue';
import { Store } from '../../../../../../store/index';
import { RouteStore, RouteStoreModule } from '../../view.store';

@Options({
	name: 'RouteDiscoverGamesViewTrophiesList',
	components: {
		AppTrophyCompletion,
		AppTrophyList,
		AppNavTabList,
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

	readonly formatNumber = formatNumber;

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
