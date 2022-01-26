<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { GameDataStoreItem } from '../../../../../../../../../_common/game/data-store/item/item.model';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../../_common/popper/popper.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { useGameDashRouteController } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiDataStorageItemsList',
	components: {
		AppPopper,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/data-storage/' + route.params.id),
})
export default class RouteDashGamesManageApiDataStorageItemsList extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	items: GameDataStoreItem[] = [];

	readonly formatDate = formatDate;

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
</script>

<template>
	<div>
		<h2 class="section-header">
			<translate>dash.games.data_store.items.heading</translate>
		</h2>

		<div class="page-help">
			<p v-translate>
				You can use the API to store data...
				<em>in the cloud!</em>
				All stored data items will show up here.
			</p>
			<p>
				<translate>
					Currently, you can only view (and remove) globally stored data items. Stored
					user data items are not viewable at this time.
				</translate>
			</p>
			<p>
				<app-link-help page="dev-data-storage" class="link-help">
					<translate>dash.games.data_store.items.page_help_link</translate>
				</app-link-help>
			</p>
		</div>

		<div class="table-responsive">
			<table class="table table-condensed">
				<colgroup>
					<col class="col-xs-3" />
					<col class="col-xs-4" />
				</colgroup>
				<thead>
					<tr>
						<th>
							<translate>dash.games.data_store.items.key_label</translate>
						</th>
						<th>
							<translate>dash.games.data_store.items.preview_label</translate>
						</th>
						<th>
							<translate>dash.games.data_store.items.date_label</translate>
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<tr v-for="item of items" :key="item.id">
						<td class="small">
							<router-link
								class="table-primary-link"
								:to="{
									name: 'dash.games.manage.api.data-storage.items.view',
									params: { item: item.id },
								}"
							>
								<code>{{ item.key }}</code>
							</router-link>
						</td>
						<td class="small">
							{{ item.data.slice(0, 50) }}
							<template v-if="item.data.length > 50"> ... </template>
						</td>
						<td class="small">
							{{ formatDate(item.posted_on, 'medium') }}
						</td>
						<td class="text-right">
							<div class="table-controls">
								<app-popper popover-class="fill-darkest">
									<a class="link-muted">
										<app-jolticon icon="ellipsis-h" />
									</a>

									<template #popover>
										<div class="list-group list-group-dark nowrap">
											<a
												class="list-group-item has-icon"
												@click="removeItem(item)"
											>
												<app-jolticon icon="remove" notice />
												<translate>
													dash.games.data_store.items.remove_button
												</translate>
											</a>
										</div>
									</template>
								</app-popper>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
