<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { kThemeFgRgb } from '../../../../../../_common/theme/variables';
import { routeDashShopProduct } from '../../product/product.route';
import { ShopItemStates, ShopManagerGroupItem, getShopProductType } from '../../shop.store';
import AppDashShopHover from '../AppDashShopHover.vue';
import AppDashShopItemImpl from './AppDashShopItemImpl.vue';

const props = defineProps({
	item: {
		type: Object as PropType<ShopManagerGroupItem>,
		required: true,
	},
	itemStates: {
		type: Object as PropType<ShopItemStates>,
		default: () => ({} as ShopItemStates),
	},
});

const { item } = toRefs(props);

const type = computed(() => getShopProductType(item.value));
</script>

<template>
	<AppDashShopHover
		v-if="type"
		:style="{ width: `100%` }"
		:border-color="
			itemStates.published ? `rgba(${kThemeFgRgb}, 0.7)` : `rgba(${kThemeFgRgb}, 0.2)`
		"
		:border-style="itemStates.published ? `solid` : `dashed`"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				type,
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
