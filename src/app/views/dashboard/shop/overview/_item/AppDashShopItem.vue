<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { ShopProductModel } from '../../../../../../_common/shop/product/product-model';
import { kThemeFgRgb } from '../../../../../../_common/theme/variables';
import { routeDashShopProduct } from '../../product/product.route';
import { getShopDashProductResourceParam, useShopDashStore } from '../../shop.store';
import AppDashShopHover from '../AppDashShopHover.vue';
import AppDashShopItemImpl from './AppDashShopItemImpl.vue';

const props = defineProps({
	item: {
		type: Object as PropType<ShopProductModel>,
		required: true,
	},
});

const { item } = toRefs(props);
const { getShopProductStates } = useShopDashStore()!;

const itemStates = computed(() => getShopProductStates(item.value));
const resourceParam = computed(() => getShopDashProductResourceParam(item.value));
</script>

<template>
	<AppDashShopHover
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
	</AppDashShopHover>
</template>
