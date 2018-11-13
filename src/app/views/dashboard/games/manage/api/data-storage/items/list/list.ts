import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameDataStoreItem } from '../../../../../../../../../lib/gj-lib-client/components/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppPopper } from '../../../../../../../../../lib/gj-lib-client/components/popper/popper';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageApiDataStorageItemsList',
	components: {
		AppPopper,
	},
	filters: {
		date,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/data-storage/' + route.params.id),
})
export default class RouteDashGamesManageApiDataStorageItemsList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	items: GameDataStoreItem[] = [];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Data Storage for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.items = GameDataStoreItem.populate($payload.items);
	}

	async removeItem(item: GameDataStoreItem) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.data_store.items.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await item.$remove();

		const index = this.items.findIndex(i => i.id === item.id);
		if (index !== -1) {
			this.items.splice(index, 1);
		}
	}
}
