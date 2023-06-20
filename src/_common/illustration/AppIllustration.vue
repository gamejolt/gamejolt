<script lang="ts">
import { CSSProperties, PropType, computed, toRefs, useSlots } from 'vue';
import AppThemeSvg from '../theme/svg/AppThemeSvg.vue';

/**
 * Run all the assets through https://squoosh.app/
 *
 * Choose OxiPNG and to reduce the color palette. We can do that since we have
 * limited colors and it doesn't degrade the images.
 */
export interface IllustrationAsset {
	path: string;
	width: number;
	height: number;
	isSvg?: boolean;
	/**
	 * Only applies to SVGs.
	 */
	strictColors?: boolean;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	asset: {
		type: Object as PropType<IllustrationAsset>,
		required: true,
	},
	sm: {
		type: Boolean,
	},
	maxWidth: {
		type: [Number, String],
		default: undefined,
		validator: value =>
			(typeof value === 'number' && value >= 0) ||
			(typeof value === 'string' && value.length > 0),
	},
	maxTextWidth: {
		type: [Number, String],
		default: 500,
		validator: value =>
			(typeof value === 'number' && value >= 0) ||
			(typeof value === 'string' && value.length > 0),
	},
	noMargin: {
		type: Boolean,
	},
	illStyles: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
});

const { asset, sm, maxWidth, maxTextWidth, noMargin, illStyles } = toRefs(props);

const slots = useSlots();

const hasContent = computed(() => !!slots.default);

const imgStyles = computed(() => {
	const result: CSSProperties = {};

	if (noMargin.value) {
		result.margin = 0;
	}
	if (maxWidth?.value) {
		result.maxWidth =
			typeof maxWidth.value === 'number' ? `${maxWidth.value}px` : maxWidth.value;
		result.height = 'auto';
	}
	if (illStyles?.value) {
		Object.assign(result, illStyles.value);
	}

	return result;
});
</script>

<template>
	<div class="-container">
		<AppThemeSvg
			v-if="asset.isSvg === true"
			class="-ill"
			:style="imgStyles"
			v-bind="{
				width: asset.width / 2,
				height: asset.height / 2,
			}"
			:src="asset.path"
			:strict-colors="asset.strictColors === true"
		/>
		<img
			v-else
			class="-ill"
			:style="imgStyles"
			:width="asset.width / 2"
			:height="asset.height / 2"
			:src="asset.path"
		/>

		<div
			v-if="hasContent"
			class="-text"
			:class="{ '-sm': sm }"
			:style="{
				maxWidth: typeof maxTextWidth === 'number' ? `${maxTextWidth}px` : maxTextWidth,
			}"
		>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-xs = 15px
$-font-size = 19px

.-container
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	text-align: center

.-ill
	margin: 24px 0
	max-width: 100%

.-text
	color: var(--theme-fg-muted)
	font-size: $-font-size-xs

	@media $media-sm-up
		&:not(.-sm)
			font-size: $-font-size
</style>
