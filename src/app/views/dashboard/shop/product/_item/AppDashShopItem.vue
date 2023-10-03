<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppDashShopHover from '../../AppDashShopHover.vue';
import { ShopManagerGroupItem, getShopProductType } from '../../shop.store';
import { routeDashShopProduct } from '../product.route';
import AppDashShopItemImpl from './AppDashShopItemImpl.vue';

export interface ShopItemStates {
	/**
	 * Either `published` for publishable items, or `is_active` for free sticker
	 * packs. No visual distinction is made between the two.
	 */
	published?: boolean;
	inReview?: boolean;
	rejected?: boolean;
}

const props = defineProps({
	item: {
		type: Object as PropType<ShopManagerGroupItem>,
		required: true,
	},
	canEdit: {
		type: Boolean,
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

<!-- TODO(creator-shops) DODO(creator-shops) See if this is how you want items
to behave when they can't be edited. -->
<template>
	<AppDashShopHover
		v-if="type"
		:border-radius="borderRadius"
		:border-width="borderWidth"
		:style="{ width: `100%` }"
		:to="
			canEdit
				? {
						name: routeDashShopProduct.name,
						params: {
							type,
							id: item.id,
						},
				  }
				: undefined
		"
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
