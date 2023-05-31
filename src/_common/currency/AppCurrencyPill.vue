<script lang="ts" setup>
import { PropType } from 'vue';
import { styleChangeBg, styleWhen } from '../../_styles/mixins';
import { formatNumber } from '../filters/number';
import { ThemeColor } from '../theme/variables';
import AppCurrencyImg from './AppCurrencyImg.vue';
import { Currency } from './currency-type';

defineProps({
	currency: {
		type: Object as PropType<Currency>,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	fillColor: {
		type: String as PropType<ThemeColor>,
		default: 'bg-offset' as ThemeColor,
	},
	overlay: {
		type: Boolean,
	},
});
</script>

<template>
	<!-- AppCurrencyPill -->
	<div
		:style="{
			...styleChangeBg(fillColor),
			display: 'flex',
			padding: '4px 6px',
			fontWeight: 'bold',
			borderRadius: '50px',
			gap: '4px',
			...styleWhen(overlay, {
				backgroundColor: `rgba(0, 0, 0, 0.87)`,
				color: `white`,
			}),
		}"
	>
		<AppCurrencyImg :currency="currency" asset-size="small" />

		{{ formatNumber(amount) }}
	</div>
</template>
