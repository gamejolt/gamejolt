import View from '!view!./list.html?style=./list.styl';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCardListAdd } from '../../../../../../../lib/gj-lib-client/components/card/list/add/add';
import { AppCardListItem } from '../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardList } from '../../../../../../../lib/gj-lib-client/components/card/list/list';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { KeyGroup } from '../../../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { AppProgressBar } from '../../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { FormGameKeyGroup } from '../../../../../../components/forms/game/key-group/key-group';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
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
