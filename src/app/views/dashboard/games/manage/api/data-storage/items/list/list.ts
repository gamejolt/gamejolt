import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameDataStoreItem } from '../../../../../../../../../lib/gj-lib-client/components/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppPopper } from '../../../../../../../../../lib/gj-lib-client/components/popper/popper';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { RouteState, RouteStore } from '../../../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageApiDataStorageItemsList',
	components: {
		AppPopper,
		AppJolticon,
	},
	filters: {
		date,
	},
})
export default class RouteDashGamesManageApiDataStorageItemsList extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	items: GameDataStoreItem[] = [];

	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/api/data-storage/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Data Storage for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
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
