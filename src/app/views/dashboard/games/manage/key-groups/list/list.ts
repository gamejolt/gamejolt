import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GamePackage } from '../../../../../../../_common/game/package/package.model';
import { KeyGroup } from '../../../../../../../_common/key-group/key-group.model';
import AppProgressBar from '../../../../../../../_common/progress/bar/bar.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import FormGameKeyGroup from '../../../../../../components/forms/game/key-group/key-group.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageKeyGroupsList',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		AppProgressBar,
		FormGameKeyGroup,
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

	readonly KeyGroup = KeyGroup;
	readonly formatNumber = formatNumber;

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