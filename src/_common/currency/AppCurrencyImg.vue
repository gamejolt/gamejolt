<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import { Currency } from '~common/currency/currency-type';
import AppIllustration from '~common/illustration/AppIllustration.vue';

type Props = {
	currency: Currency;
	assetSize?: 'small' | 'large';
	maxWidth?: number | string;
	/**
	 * Only affects currency assets that are IllustrationAssets.
	 */
	illStyles?: CSSProperties;
};
const { currency, assetSize = 'small', maxWidth = 20, illStyles } = defineProps<Props>();

const asset = computed(() => {
	if (assetSize === 'small') {
		return currency.smallAsset;
	}
	return currency.asset;
});
</script>

<template>
	<!-- AppCurrencyImg -->
	<img
		v-if="typeof asset === 'string'"
		:src="asset"
		:width="maxWidth"
		:height="maxWidth"
		:alt="currency.label"
	/>
	<AppIllustration
		v-else
		:asset="asset"
		:max-width="maxWidth"
		:ill-styles="illStyles"
		no-margin
	/>
</template>
