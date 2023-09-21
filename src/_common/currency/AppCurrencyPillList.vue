<script lang="ts" setup>
import { CSSProperties, PropType, toRefs } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { ThemeColor } from '../theme/variables';
import AppCurrencyPill from './AppCurrencyPill.vue';
import { CurrencyCostData } from './currency-type';

const props = defineProps({
	currencies: {
		type: Object as PropType<CurrencyCostData>,
		required: true,
	},
	direction: {
		type: String as PropType<'row' | 'column'>,
		default: 'row',
		validator: (value: string) => ['row', 'column'].includes(value),
	},
	mainAlign: {
		type: String as PropType<CSSProperties['justify-content']>,
		default: 'center',
	},
	crossAlign: {
		type: String as PropType<CSSProperties['align-items']>,
		default: 'center',
	},
	gap: {
		type: [Number, String] as PropType<number | string>,
		default: 0,
		validator: (value: unknown) => {
			if (typeof value === 'number') {
				return value >= 0;
			} else if (typeof value === 'string') {
				// Only allow positive 'px' values.
				return (
					value.length > 2 && value.endsWith('px') && Number(value.split('px')[0]) >= 0
				);
			}
			return false;
		},
	},
	wrap: {
		type: Boolean,
		default: false,
	},
	fillColor: {
		type: String as PropType<ThemeColor>,
		default: 'bg-offset' as ThemeColor,
	},
	overlay: {
		type: Boolean,
	},
});

const { currencies, direction, mainAlign, crossAlign, gap, wrap, fillColor, overlay } =
	toRefs(props);
</script>

<template>
	<!-- AppCurrencyPillList -->
	<div
		:style="{
			display: `inline-flex`,
			flexDirection: direction,
			alignItems: crossAlign,
			justifyContent: mainAlign,
			gap: typeof gap === 'number' ? `${gap}px` : gap,
			...styleWhen(wrap, {
				flexWrap: 'wrap',
			}),
		}"
	>
		<AppCurrencyPill
			v-for="[, [currency, amount]] in Object.entries(currencies)"
			:key="currency.id"
			:currency="currency"
			:amount="amount"
			:fill-color="fillColor"
			:overlay="overlay"
		/>
	</div>
</template>
