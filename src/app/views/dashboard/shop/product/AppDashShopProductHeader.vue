<script lang="ts" setup>
import { PropType } from 'vue';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { kThemeGjGreen } from '../../../../../_common/theme/variables';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg } from '../../../../../_styles/mixins';
import { ShopProductPremiumColor } from '../shop.store';
import { ShopProductPaymentType } from './_forms/FormShopProductBase.vue';

defineProps({
	paymentType: {
		type: String as PropType<ShopProductPaymentType | undefined>,
		default: undefined,
	},
	heading: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		default: '',
	},
});
</script>

<template>
	<!-- Premium/charge tag -->
	<div
		v-if="paymentType"
		:style="[
			styleBorderRadiusLg,
			{
				display: `inline-block`,
				fontWeight: `bold`,
				padding: `2px 6px`,
			},
			paymentType === ShopProductPaymentType.Premium
				? {
						backgroundColor: ShopProductPremiumColor,
						color: `black`,
				  }
				: {
						backgroundColor: `black`,
						color: kThemeGjGreen,
				  },
		]"
	>
		<template v-if="paymentType === ShopProductPaymentType.Premium">
			{{ $gettext(`Premium`) }}
		</template>
		<template v-else>
			{{ $gettext(`Charge`) }}
		</template>
	</div>

	<!-- Title -->
	<h1 :style="{ margin: `4px 0` }">{{ heading }}</h1>

	<!-- Extra message -->
	<div v-if="paymentType && message">
		{{ message }}
	</div>

	<AppSpacer vertical :scale="6" />
</template>
