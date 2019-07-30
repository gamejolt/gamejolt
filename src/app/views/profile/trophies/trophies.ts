import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/trophy/game-trophy.model';
import { UserSiteTrophy } from 'game-jolt-frontend-lib/components/user/trophy/site-trophy-model';
import { UserBaseTrophy } from 'game-jolt-frontend-lib/components/user/trophy/user-base-trophy.model';
import { numberSort } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import AppTrophyCard from '../../../components/trophy/card/card.vue';
import AppUserLevelWidget from '../../../components/user/level-widget/level-widget.vue';
import { RouteStore, RouteStoreModule } from '../profile.store';

@Component({
	name: 'RouteProfileTrophies',
	components: {
		AppTrophyCard,
		AppUserLevelWidget,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/profile/trophies/@' + route.params.username),
})
export default class RouteProfileTrophies extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	gameTrophies: UserGameTrophy[] = [];
	siteTrophies: UserSiteTrophy[] = [];

	get trophies(): UserBaseTrophy[] {
		return (this.gameTrophies as UserBaseTrophy[])
			.concat(...this.siteTrophies)
			.sort((a, b) => numberSort(b.logged_on, a.logged_on));
	}

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`@%{ user }'s Trophy Case`, {
				user: this.user.username,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.gameTrophies = UserGameTrophy.populate($payload.gameTrophies);
		this.siteTrophies = UserSiteTrophy.populate($payload.siteTrophies);
	}
}
