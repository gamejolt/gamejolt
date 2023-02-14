<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleChangeBg } from '../../_styles/mixins';
import { formatNumber } from '../filters/number';
import { imageCoins, imageGems } from '../img/images';
import { ThemeColor } from '../theme/variables';

const props = defineProps({
	currency: {
		type: String as PropType<'coins' | 'gems'>,
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
});

const { currency } = toRefs(props);

const image = computed(() => {
	if (currency.value === 'coins') {
		return imageCoins;
	} else if (currency.value === 'gems') {
		return imageGems;
	}
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
		}"
	>
		<img v-if="image" :src="image" width="20" height="20" alt="Coins" />
		{{ formatNumber(amount) }}
	</div>
</template>
