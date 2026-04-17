<script lang="ts" setup>
import { computed } from 'vue';

import { ShopDashProductType } from '~app/views/dashboard/shop/shop.store';
import { kThemeGjBlue, kThemeGray } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';

const ShopProductPremiumColor = '#ffbe00';

type Props = {
	productType: ShopDashProductType;
};
const { productType } = defineProps<Props>();

const label = computed(() => {
	switch (productType) {
		case 'premium':
			return $gettext(`Premium`);
		case 'reward':
			return $gettext(`Reward`);
		default:
			return $gettext(`Basic`);
	}
});
</script>

<template>
	<div
		class="rounded-lg"
		:style="{
			display: `inline-block`,
			fontWeight: `bold`,
			padding: `2px 6px`,
			backgroundColor:
				productType === ShopDashProductType.Premium
					? ShopProductPremiumColor
					: productType === ShopDashProductType.Basic
					? kThemeGray
					: productType === ShopDashProductType.Reward
					? kThemeGjBlue
					: undefined,
			color:
				productType === ShopDashProductType.Basic
					? `white`
					: productType === ShopDashProductType.Premium ||
					  productType === ShopDashProductType.Reward
					? `black`
					: undefined,
		}"
	>
		{{ label }}
	</div>
</template>
