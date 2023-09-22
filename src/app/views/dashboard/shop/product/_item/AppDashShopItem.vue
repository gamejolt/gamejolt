<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppDashShopHover from '../../AppDashShopHover.vue';
import { ShopManagerGroupItem, getShopProductType } from '../../shop.store';
import { routeDashShopProduct } from '../product.route';
import AppDashShopItemImpl from './AppDashShopItemImpl.vue';

export interface ShopItemStates {
	active?: boolean;
	inReview?: boolean;
	rejected?: boolean;
}

const props = defineProps({
	item: {
		type: Object as PropType<ShopManagerGroupItem>,
		required: true,
	},
	borderRadius: {
		type: Number,
		default: undefined,
	},
	borderWidth: {
		type: Number,
		default: undefined,
	},
	itemStates: {
		type: Object as PropType<ShopItemStates>,
		default: () => ({} as ShopItemStates),
	},
});

const { item, borderRadius } = toRefs(props);

const type = computed(() => getShopProductType(item.value));
</script>

<template>
	<AppDashShopHover
		v-if="type"
		:border-radius="borderRadius"
		:border-width="borderWidth"
		:style="{ width: `100%` }"
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
				:border-radius="parentRadius"
				:hovered="hovered"
			/>
		</template>
	</AppDashShopHover>
</template>
