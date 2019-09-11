import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameDataStoreItem } from '../../../../../../../../../_common/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../../_common/popper/popper.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { date } from '../../../../../../../../../_common/filters/date';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

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
