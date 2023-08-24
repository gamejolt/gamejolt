<script lang="ts" setup>
import { PropType } from 'vue';
import AppCurrencyPillList from '../../../../../_common/currency/AppCurrencyPillList.vue';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';

defineProps({
	shopProduct: {
		type: Object as PropType<InventoryShopProductSaleModel>,
		required: true,
	},
});
</script>

<template>
	<AppCurrencyPillList
		:currencies="shopProduct.validPricingsData"
		direction="column"
		cross-align="flex-end"
		:gap="4"
		overlay
	/>
</template>
