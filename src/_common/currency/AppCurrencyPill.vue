<script lang="ts" setup>
import { styleChangeBg, styleWhen } from '../../_styles/mixins';
import { formatNumber } from '../filters/number';
import { ThemeColor } from '../theme/variables';
import AppCurrencyImg from './AppCurrencyImg.vue';
import { Currency } from './currency-type';

type Props = {
	currency: Currency;
	amount: number;
	fillColor?: ThemeColor;
	overlay?: boolean;
};
const { currency, amount, fillColor = 'bg-offset', overlay } = defineProps<Props>();
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
