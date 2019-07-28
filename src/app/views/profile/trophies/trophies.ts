import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/trophy/game-trophy.model';
import { UserBaseTrophy } from 'game-jolt-frontend-lib/components/user/trophy/user-base-trophy.model';
import { Component } from 'vue-property-decorator';
import AppTrophyCard from '../../../components/trophy/card/card.vue';
import { RouteStore, RouteStoreModule } from '../profile.store';

@Component({
	name: 'RouteProfileTrophies',
	components: {
		AppTrophyCard,
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

	get trophies(): UserBaseTrophy[] {
		return this.gameTrophies;
	}

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`Trophies of @%{ user }`, {
				user: this.user.username,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.gameTrophies = UserGameTrophy.populate($payload.gameTrophies);
	}
}
