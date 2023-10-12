<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { kThemeGjBlue, kThemeGray } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleWhen } from '../../../../_styles/mixins';
import { ShopDashProductType } from './shop.store';

const ShopProductPremiumColor = '#ffbe00';

const props = defineProps({
	productType: {
		type: String as PropType<ShopDashProductType>,
		required: true,
	},
});

const { productType } = toRefs(props);

const label = computed(() => {
	switch (productType.value) {
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
			...styleWhen(productType === ShopDashProductType.Premium, {
				backgroundColor: ShopProductPremiumColor,
				color: `black`,
			}),
			...styleWhen(productType === ShopDashProductType.Basic, {
				backgroundColor: kThemeGray,
				color: `white`,
			}),
			...styleWhen(productType === ShopDashProductType.Reward, {
				backgroundColor: kThemeGjBlue,
				color: `black`,
			}),
		}"
	>
		{{ label }}
	</div>
</template>
