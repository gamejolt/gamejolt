<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { GameDataStoreItem } from '../../../../../../../../../_common/game/data-store/item/item.model';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../../_common/popper/AppPopper.vue';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../../../../_common/route/route-component';
import { useGameDashRouteController } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiDataStorageItemsList',
	components: {
		AppPopper,
	},
})
@OptionsForRoute({
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
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this item?')
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
			<AppTranslate translate-comment="Refers to game API data store">
				Data Storage Items
			</AppTranslate>
		</h2>

		<div class="page-help">
			<p v-translate>
				You can use the API to store data...
				<em>in the cloud!</em>
				All stored data items will show up here.
			</p>
			<p>
				<AppTranslate>
					Currently, you can only view (and remove) globally stored data items. Stored
					user data items are not viewable at this time.
				</AppTranslate>
			</p>
			<p>
				<AppLinkHelp page="dev-data-storage" class="link-help">
					<AppTranslate>Learn more about data storage...</AppTranslate>
				</AppLinkHelp>
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
							<AppTranslate
								translate-comment="Refers to the key name for a game API data store item"
							>
								Key
							</AppTranslate>
						</th>
						<th>
							<AppTranslate
								translate-comment="Used when previewing a game API data store item value"
							>
								Data Preview
							</AppTranslate>
						</th>
						<th>
							<AppTranslate
								translate-comment="Refers to the date/time when a game API data store item was created"
							>
								Stored On
							</AppTranslate>
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
								<AppPopper popover-class="fill-darkest">
									<a class="link-muted">
										<AppJolticon icon="ellipsis-h" />
									</a>

									<template #popover>
										<div class="list-group list-group-dark nowrap">
											<a
												class="list-group-item has-icon"
												@click="removeItem(item)"
											>
												<AppJolticon icon="remove" notice />
												{{ ' ' }}
												<AppTranslate
													translate-comment="Used to remove a game API data store item"
												>
													Remove Item
												</AppTranslate>
											</a>
										</div>
									</template>
								</AppPopper>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
