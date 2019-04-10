import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { GameDataStoreItem } from 'game-jolt-frontend-lib/components/game/data-store/item/item.model';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

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
