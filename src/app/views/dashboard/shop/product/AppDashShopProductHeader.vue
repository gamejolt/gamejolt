<script lang="ts" setup>
import AppDashShopProductType from '~app/views/dashboard/shop/AppDashShopProductType.vue';
import { ShopDashProductType } from '~app/views/dashboard/shop/shop.store';
import AppSpacer from '~common/spacer/AppSpacer.vue';

type Props = {
	productType?: ShopDashProductType;
	heading: string;
};
defineProps<Props>();
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
