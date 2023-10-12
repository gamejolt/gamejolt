<script lang="ts" setup>
import { PropType } from 'vue';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppDashShopProductType from '../AppDashShopProductType.vue';
import { ShopDashProductType } from '../shop.store';

defineProps({
	productType: {
		type: String as PropType<ShopDashProductType | undefined>,
		default: undefined,
	},
	heading: {
		type: String,
		required: true,
	},
});
</script>

<template>
	<!-- Type tag tag -->
	<AppDashShopProductType v-if="productType" :product-type="productType" />

	<!-- Title -->
	<h1 :style="{ margin: `4px 0` }">{{ heading }}</h1>

	<!-- Extra message -->
	<div v-if="productType && $slots.default">
		<slot />
	</div>

	<AppSpacer vertical :scale="6" />
</template>
