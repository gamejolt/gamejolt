import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { GameTrophy } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { BaseTrophy } from 'game-jolt-frontend-lib/components/trophy/base-trophy';
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

	trophies: BaseTrophy[] = [];

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`Trophies of @%{ user }`, {
				user: this.user.username,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.trophies = GameTrophy.populate($payload.trophies);
	}
}
