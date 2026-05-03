<script lang="ts" setup>
import { computed } from 'vue';

import {
	ShopDashProductType,
	ShopDashProductTypeBasic,
	ShopDashProductTypePremium,
	ShopDashProductTypeReward,
} from '~app/views/dashboard/shop/shop.store';
import { kThemeGjBlue, kThemeGray } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { styleBorderRadiusLg, styleWhen } from '~styles/mixins';

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
		:style="{
			...styleBorderRadiusLg,
			display: `inline-block`,
			fontWeight: `bold`,
			padding: `2px 6px`,
			...styleWhen(productType === ShopDashProductTypePremium, {
				backgroundColor: ShopProductPremiumColor,
				color: `black`,
			}),
			...styleWhen(productType === ShopDashProductTypeBasic, {
				backgroundColor: kThemeGray,
				color: `white`,
			}),
			...styleWhen(productType === ShopDashProductTypeReward, {
				backgroundColor: kThemeGjBlue,
				color: `black`,
			}),
		}"
	>
		{{ label }}
	</div>
</template>
