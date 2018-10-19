import View from '!view!./view.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameDataStoreItem } from '../../../../../../../../../lib/gj-lib-client/components/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageApiDataStorageItemsView',
	components: {
		AppJolticon,
	},
	filters: {
		date,
	},
})
@RouteResolver({
	deps: { params: ['item'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/data-storage/' +
				route.params.id +
				'/' +
				route.params.item
		),
})
export default class RouteDashGamesManageApiDataStorageItemsView extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	item: GameDataStoreItem = null as any;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Item Details - %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.item = new GameDataStoreItem($payload.item);
	}

	async remove() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.data_store.items.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await this.item.$remove();
		this.$router.push('dash.games.manage.api.data-storage.items.list');
	}
}
