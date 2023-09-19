<script lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { defineAppRouteOptions } from '../../../../../_common/route/route-component';
import { touchUser } from '../../../../../_common/user/user.model';
import { useShopManagerStore } from '../RouteDashShop.vue';
import FormShopProductAvatarFrame from './_form/FormShopProductAvatarFrame.vue';

export default {
	...defineAppRouteOptions({
		deps: {
			params: ['id', 'typename'],
			query: ['premium'],
		},
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const { castTypename } = useShopManagerStore()!;

const id = computed(() => {
	let id = route.params.id;
	if (Array.isArray(id)) {
		id = id[0];
	}
	return parseInt(id, 10);
});
const typename = computed(() => castTypename(`${route.params.typename}`));
const premium = computed(() => !!route.query.premium);
</script>

<template>
	<FormShopProductAvatarFrame
		v-if="typename === 'Avatar_Frame'"
		:model-id="id"
		:premium="premium"
	/>
	<!-- <FormShopProductBackground
		v-else-if="typename === 'Background'"
		:model-id="id"
		:premium="premium"
	/>
	<FormShopProductStickerPack
		v-else-if="typename === 'Sticker_Pack'"
		:model-id="id"
		:premium="premium"
	/>
	<FormShopProductSticker v-else-if="typename === 'Sticker'" :model-id="id" :premium="premium" /> -->
</template>
