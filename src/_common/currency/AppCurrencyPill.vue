<script lang="ts" setup>
import AppCurrencyImg from '~common/currency/AppCurrencyImg.vue';
import { Currency } from '~common/currency/currency-type';
import { formatNumber } from '~common/filters/number';
import { ThemeColor } from '~common/theme/variables';

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
		class="flex font-bold rounded-[50px] gap-[4px] py-[4px] px-[6px]"
		:class="[`change-bg-${fillColor}`, { '!bg-[rgba(0,0,0,0.87)] !text-white': overlay }]"
	>
		<AppCurrencyImg :currency="currency" asset-size="small" />

		{{ formatNumber(amount) }}
	</div>
</template>
