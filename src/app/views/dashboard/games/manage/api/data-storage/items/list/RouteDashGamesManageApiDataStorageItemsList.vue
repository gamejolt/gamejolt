<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import {
	$removeGameDataStoreItem,
	GameDataStoreItemModel,
} from '../../../../../../../../../_common/game/data-store/item/item.model';
import AppJolticon from '../../../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLinkHelp from '../../../../../../../../../_common/link/AppLinkHelp.vue';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../../_common/popper/AppPopper.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import { useGameDashRouteController } from '../../../../manage.store';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/api/data-storage/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const items = ref<GameDataStoreItemModel[]>([]);

async function removeItem(item: GameDataStoreItemModel) {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this item?'));

	if (!result) {
		return;
	}

	await $removeGameDataStoreItem(item);

	const index = items.value.findIndex(i => i.id === item.id);
	if (index !== -1) {
		items.value.splice(index, 1);
	}
}

createAppRoute({
	routeTitle: computed(() => {
		if (game) {
			return $gettext('Manage Data Storage for %{ game }', {
				game: game.value!.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		items.value = GameDataStoreItemModel.populate(payload.items);
	},
});
</script>

<template>
	<div>
		<h2 class="section-header">
			{{ $gettext(`Data Storage Items`) }}
		</h2>

		<div class="page-help">
			<p v-translate>
				You can use the API to store data...
				<em>in the cloud!</em>
				All stored data items will show up here.
			</p>
			<p>
				{{
					$gettext(
						`Currently, you can only view (and remove) globally stored data items. Stored user data items are not viewable at this time.`
					)
				}}
			</p>
			<p>
				<AppLinkHelp page="dev-data-storage" class="link-help">
					{{ $gettext(`Learn more about data storage...`) }}
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
							{{ $gettext(`Key`) }}
						</th>
						<th>
							{{ $gettext(`Data Preview`) }}
						</th>
						<th>
							{{ $gettext(`Stored On`) }}
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<tr v-for="item of items" :key="item.id">
						<td class="small">
							<RouterLink
								class="table-primary-link"
								:to="{
									name: 'dash.games.manage.api.data-storage.items.view',
									params: { item: item.id },
								}"
							>
								<code>{{ item.key }}</code>
							</RouterLink>
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
												{{ $gettext(`Remove Item`) }}
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
