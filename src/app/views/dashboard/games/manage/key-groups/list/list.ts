import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCardListAdd from 'game-jolt-frontend-lib/components/card/list/add/add.vue';
import AppCardListItem from 'game-jolt-frontend-lib/components/card/list/item/item.vue';
import AppCardList from 'game-jolt-frontend-lib/components/card/list/list.vue';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { KeyGroup } from 'game-jolt-frontend-lib/components/key-group/key-group.model';
import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import FormGameKeyGroup from '../../../../../../components/forms/game/key-group/key-group.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageKeyGroupsList',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		AppProgressBar,
		FormGameKeyGroup,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/key-groups/' + route.params.id),
})
export default class RouteDashGamesManageKeyGroupsList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	keyGroups: KeyGroup[] = [];
	packages: GamePackage[] = [];
	isAdding = false;

	KeyGroup = KeyGroup;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Key Groups for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.keyGroups = KeyGroup.populate($payload.keyGroups);
		this.packages = GamePackage.populate($payload.packages);
	}

	onKeyGroupAdded(keyGroup: KeyGroup) {
		this.$router.push({
			name: 'dash.games.manage.key-groups.edit',
			params: {
				keyGroupId: keyGroup.id + '',
			},
		});
	}
}
