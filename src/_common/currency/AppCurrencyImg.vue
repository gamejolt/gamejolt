<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppIllustration from '../illustration/AppIllustration.vue';
import { Currency } from './currency-type';

const props = defineProps({
	currency: {
		type: Object as PropType<Currency>,
		required: true,
	},
	assetSize: {
		type: String as PropType<'small' | 'large'>,
		default: 'small',
	},
	maxWidth: {
		type: [Number, String],
		default: 20,
		validator: value =>
			(typeof value === 'number' && value >= 0) ||
			(typeof value === 'string' && value.length > 0),
	},
	/**
	 * Only affects currency assets that are IllustrationAssets.
	 */
	illStyles: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
});

const { currency, assetSize, maxWidth } = toRefs(props);

const asset = computed(() => {
	if (assetSize.value === 'small') {
		return currency.value.smallAsset;
	}
	return currency.value.asset;
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
