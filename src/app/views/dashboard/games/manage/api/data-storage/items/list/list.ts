import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./list.html';

import { GameDataStoreItem } from '../../../../../../../../../lib/gj-lib-client/components/game/data-store/item/item.model';
import { RouteState, RouteStore } from '../../../../manage.store';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { AppPopoverTrigger } from '../../../../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageApiDataStorageItemsList',
	components: {
		AppPopover,
		AppJolticon,
	},
	directives: {
		AppPopoverTrigger,
	},
	filters: {
		date,
	},
})
export default class RouteDashGamesManageApiDataStorageItemsList extends BaseRouteComponent {
	@RouteState game!: RouteStore['game'];

	items: GameDataStoreItem[] = [];

	@RouteResolve()
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
