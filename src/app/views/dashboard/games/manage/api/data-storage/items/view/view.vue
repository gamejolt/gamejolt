<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { GameDataStoreItem } from '../../../../../../../../../_common/game/data-store/item/item.model';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../../../../_common/route/route-component';
import { useGameDashRouteController } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiDataStorageItemsView',
})
@OptionsForRoute({
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
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this item?')
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
				<AppButton sparse icon="remove" @click="remove" />
			</div>

			<AppTranslate translate-comment="Refers to game API data store items">
				Item Details
			</AppTranslate>
		</h2>

		<div class="table-responsive">
			<table class="table table-fixed">
				<colgroup>
					<col class="col-sm-3 col-md-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							<AppTranslate translate-comment="This refers to game API key">
								Key
							</AppTranslate>
						</th>
						<td>
							<code>{{ item.key }}</code>
						</td>
					</tr>
					<tr>
						<th>
							<AppTranslate
								translate-comment="Refers to the date/time when a game API data store item was created"
							>
								Stored On
							</AppTranslate>
						</th>
						<td>
							{{ formatDate(item.posted_on, 'medium') }}
						</td>
					</tr>
					<tr>
						<th>
							<AppTranslate
								translate-comment="Refers to the value of a game API data store item"
							>
								Item Data
							</AppTranslate>
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
