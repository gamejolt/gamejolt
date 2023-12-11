<script lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import {
	$removeGameDataStoreItem,
	GameDataStoreItemModel,
} from '../../../../../../../../../_common/game/data-store/item/item.model';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import { useGameDashRouteController } from '../../../../manage.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['item'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/developer/games/api/data-storage/' +
					route.params.id +
					'/' +
					route.params.item
			),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;
const router = useRouter();

const item = ref<GameDataStoreItemModel>(null as any);

async function remove() {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this item?'));

	if (!result) {
		return;
	}

	await $removeGameDataStoreItem(item.value);
	router.push({ name: 'dash.games.manage.api.data-storage.items.list' });
}

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		if (game) {
			return $gettext('Item Details - %{ game }', {
				game: game.value!.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		item.value = new GameDataStoreItemModel(payload.item);
	},
});
</script>

<template>
	<div v-if="isBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<AppButton sparse icon="remove" @click="remove" />
			</div>
			{{ $gettext(`Item Details`) }}
		</h2>

		<div class="table-responsive">
			<table class="table table-fixed">
				<colgroup>
					<col class="col-sm-3 col-md-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							{{ $gettext(`Key`) }}
						</th>
						<td>
							<code>{{ item.key }}</code>
						</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Stored On`) }}
						</th>
						<td>
							{{ formatDate(item.posted_on, 'medium') }}
						</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Item Data`) }}
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
