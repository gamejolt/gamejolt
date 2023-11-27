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
			<!--TODO(component-setup-refactor-routes-1): how do we replace AppTranslates
				which are with translate-comment-->
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
