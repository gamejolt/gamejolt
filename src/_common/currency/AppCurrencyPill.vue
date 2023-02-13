<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatNumber } from '../filters/number';
import { imageCoins, imageGems } from '../img/images';

const props = defineProps({
	currency: {
		type: String as PropType<'coins' | 'gems'>,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
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
		class="fill-offset"
		:style="{
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
