<script lang="ts" setup>
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppDashShopProductType from '../AppDashShopProductType.vue';
import { ShopDashProductType } from '../shop.store';

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
