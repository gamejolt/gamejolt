import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { GameDataStoreItem } from '../../../../../../../../../_common/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiDataStorageItemsView',
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

	readonly date = formatDate;

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
		this.$router.push({ name: 'dash.games.manage.api.data-storage.items.list' });
	}
}
