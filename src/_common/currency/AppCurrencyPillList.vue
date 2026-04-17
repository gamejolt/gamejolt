<script lang="ts" setup>
import { CSSProperties } from 'vue';

import AppCurrencyPill from '~common/currency/AppCurrencyPill.vue';
import { CurrencyCostData } from '~common/currency/currency-type';
import { ThemeColor } from '~common/theme/variables';

type Props = {
	currencies: CurrencyCostData;
	direction?: 'row' | 'column';
	mainAlign?: CSSProperties['justify-content'];
	crossAlign?: CSSProperties['align-items'];
	gap?: number | string;
	wrap?: boolean;
	fillColor?: ThemeColor;
	overlay?: boolean;
};
const {
	currencies,
	direction = 'row',
	mainAlign = 'center',
	crossAlign = 'center',
	gap = 0,
	wrap = false,
	fillColor = 'bg-offset',
	overlay,
} = defineProps<Props>();
</script>

<template>
	<!-- AppCurrencyPillList -->
	<div
		class="inline-flex"
		:class="{ 'flex-wrap': wrap }"
		:style="{
			flexDirection: direction,
			alignItems: crossAlign,
			justifyContent: mainAlign,
			gap: typeof gap === 'number' ? `${gap}px` : gap,
		}"
	>
		<AppCurrencyPill
			v-for="[currency, amount] in Object.values(currencies)"
			:key="currency.id"
			:currency="currency"
			:amount="amount"
			:fill-color="fillColor"
			:overlay="overlay"
		/>
	</div>
</template>
