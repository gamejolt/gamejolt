<script lang="ts" setup>
import { computed } from 'vue';

import AppDashShopItemImpl from '~app/views/dashboard/shop/overview/_item/AppDashShopItemImpl.vue';
import { routeDashShopProduct } from '~app/views/dashboard/shop/product/product.route';
import { getShopDashProductResourceParam, useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import AppHoverCard from '~common/card/AppHoverCard.vue';
import { ShopProductModel } from '~common/shop/product/product-model';
import { kThemeFgRgb } from '~common/theme/variables';

type Props = {
	item: ShopProductModel;
};
const { item } = defineProps<Props>();

const { getShopProductStates } = useShopDashStore()!;

const itemStates = computed(() => getShopProductStates(item));
const resourceParam = computed(() => getShopDashProductResourceParam(item));
</script>

<template>
	<AppHoverCard
		v-if="resourceParam"
		:style="{ width: `100%` }"
		:border-color="
			itemStates.published ? `rgba(${kThemeFgRgb}, 0.7)` : `rgba(${kThemeFgRgb}, 0.2)`
		"
		:border-style="itemStates.published ? `solid` : `dashed`"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				resource: resourceParam,
				id: item.id,
			},
		}"
	>
		<template #default="{ borderRadius: parentRadius, hovered }">
			<AppDashShopItemImpl
				:item="item"
				:item-states="itemStates"
				:border-radius="parentRadius.value"
				:hovered="hovered"
			/>
		</template>
	</AppHoverCard>
</template>
