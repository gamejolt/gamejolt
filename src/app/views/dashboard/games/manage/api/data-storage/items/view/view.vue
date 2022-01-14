<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { GameDataStoreItem } from '../../../../../../../../../_common/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { useGameDashRouteController } from '../../../../manage.store';

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
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	item: GameDataStoreItem = null as any;

	readonly formatDate = formatDate;

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
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<app-button sparse icon="remove" @click="remove" />
			</div>

			<translate>dash.games.data_store.items.view.heading</translate>
		</h2>

		<div class="table-responsive">
			<table class="table table-fixed">
				<colgroup>
					<col class="col-sm-3 col-md-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							<translate>dash.games.data_store.items.view.key_label</translate>
						</th>
						<td>
							<code>{{ item.key }}</code>
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.data_store.items.view.date_label</translate>
						</th>
						<td>
							{{ formatDate(item.posted_on, 'medium') }}
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.data_store.items.view.data_label</translate>
						</th>
						<td class="small">
							<pre>{{ item.data }}</pre>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
