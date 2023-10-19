<script lang="ts" setup>
import { PropType } from 'vue';
import AppCurrencyPillList from '../../../../../_common/currency/AppCurrencyPillList.vue';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { ThemeColor } from '../../../../../_common/theme/variables';

defineProps({
	shopProduct: {
		type: Object as PropType<InventoryShopProductSaleModel>,
		required: true,
	},
	direction: {
		type: String as PropType<'row' | 'column'>,
		default: 'column',
	},
	fillColor: {
		type: String as PropType<ThemeColor>,
		default: undefined,
	},
});
</script>

<template>
	<AppCurrencyPillList
		:currencies="shopProduct.validPricingsData"
		:direction="direction"
		cross-align="flex-end"
		:fill-color="fillColor"
		:gap="4"
		overlay
	/>
</template>
