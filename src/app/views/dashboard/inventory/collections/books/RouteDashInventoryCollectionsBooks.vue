<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppCollectionBook from '../../../../../../_common/inventory/AppCollectionBook.vue';
import {
	COLLECTION_TYPE_GAME,
	COLLECTION_TYPE_GAMEJOLT,
	COLLECTION_TYPE_USER,
	InventoryCollection,
} from '../../../../../../_common/inventory/collection.model';
import { ModelData } from '../../../../../../_common/model/model.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppShellPageBackdrop from '../../../../../components/shell/AppShellPageBackdrop.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendFieldsRequest('/mobile/inventory', { collections: true }),
	}),
	components: { AppShellPageBackdrop, AppCollectionBook },
};

type InitPayload = {
	collections: ModelData<InventoryCollection[]>;
};
</script>

<script lang="ts" setup>
const collections = ref([]) as Ref<InventoryCollection[]>;

const hasGameJoltCollections = computed(() => {
	return collections.value.some(collection => collection.type === COLLECTION_TYPE_GAMEJOLT);
});
const hasGameCollections = computed(() => {
	return collections.value.some(collection => collection.type === COLLECTION_TYPE_GAME);
});
const hasUserCollections = computed(() => {
	return collections.value.some(collection => collection.type === COLLECTION_TYPE_USER);
});

const routeTitle = computed(() => $gettext(`Browse Collections`));

createAppRoute({
	routeTitle,
	onResolved(data) {
		const payload: InitPayload = data.payload;

		collections.value = InventoryCollection.populate(payload.collections);
	},
});
</script>

<template>
	<!-- RouteDashInventoryCollectionsBooks -->
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<h1 class="sans-margin-top _title">{{ $gettext(`Browse Collections`) }}</h1>

				<AppCollectionBook
					:type="COLLECTION_TYPE_GAMEJOLT"
					:can-select="hasGameJoltCollections"
				/>
				<AppCollectionBook :type="COLLECTION_TYPE_USER" :can-select="hasUserCollections" />
				<AppCollectionBook :type="COLLECTION_TYPE_GAME" :can-select="hasGameCollections" />
			</div>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
._title
	font-family: 'Germania'
</style>
