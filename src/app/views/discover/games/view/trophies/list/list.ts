import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { GameTrophy } from '../../../../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { UserGameTrophy } from '../../../../../../../lib/gj-lib-client/components/user/game-trophy/game-trophy.model';
import { AppTrophyCompletion } from '../../../../../../components/trophy/completion/completion';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTrophyList } from '../../../../../../components/trophy/list/list';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppNavTabList } from '../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { RouteState, RouteStore } from '../../view.store';
import { Store } from '../../../../../../store/index';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

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
export default class RouteDiscoverGamesViewTrophiesList extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	@State app: Store['app'];

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

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/discover/games/trophies/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Trophies for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routed() {
		this.trophies = GameTrophy.populate(this.$payload.trophies);
		this.achieved = this.$payload.trophiesAchieved
			? UserGameTrophy.populate(this.$payload.trophiesAchieved)
			: [];
		this.experience = this.$payload.trophiesExperienceAchieved || 0;
		this.showInvisibleTrophyMessage = this.$payload.trophiesShowInvisibleTrophyMessage || false;

		this.achievedIndexed = UserGameTrophy.indexAchieved(this.achieved);
		this.filteredTrophies = GameTrophy.splitAchieved(this.trophies, this.achievedIndexed);

		this.currentFilter = 'all';
	}
}
