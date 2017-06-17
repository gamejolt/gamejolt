import Vue from 'vue';
import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { GameTrophy } from '../../../../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { UserGameTrophy } from '../../../../../../../lib/gj-lib-client/components/user/game-trophy/game-trophy.model';
import { AppTrophyCompletion } from '../../../../../../components/trophy/completion/completion';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTrophyList } from '../../../../../../components/trophy/list/list';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppNavTabList } from '../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { RouteState, RouteStore } from '../../view.state';
import { Store } from '../../../../../../store/index';

@View
@Component({
	components: {
		AppTrophyCompletion,
		AppTrophyList,
		AppNavTabList,
	},
	filters: {
		number,
	},
})
export default class RouteDiscoverGamesViewTrophiesList extends Vue {
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

	@BeforeRouteEnter({ cache: true })
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/discover/games/trophies/' + route.params.id);
	}

	routed() {
		Meta.title = this.$gettextInterpolate(`Trophies for %{ game }`, {
			game: this.game.title,
		});

		this.trophies = GameTrophy.populate(this.$payload.trophies);
		this.achieved = this.$payload.trophiesAchieved
			? UserGameTrophy.populate(this.$payload.trophiesAchieved)
			: [];
		this.experience = this.$payload.trophiesExperienceAchieved || 0;
		this.showInvisibleTrophyMessage =
			this.$payload.trophiesShowInvisibleTrophyMessage || false;

		this.achievedIndexed = UserGameTrophy.indexAchieved(this.achieved);
		this.filteredTrophies = GameTrophy.splitAchieved(
			this.trophies,
			this.achievedIndexed,
		);

		this.currentFilter = 'all';
	}
}
